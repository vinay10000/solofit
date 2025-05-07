import { NhostClient, NhostClientConstructorParams } from '@nhost/nhost-js';
import { Request, Response } from 'express'; // Assuming Express signature if triggered via HTTP/webhook
import gql from 'graphql-tag'; // Or import { gql } from 'graphql-request' if using that

// Define interfaces for cleaner code (adjust based on your actual schema/queries)
interface UserWithStats {
  id: string;
  stat: {
    level: number;
    fitness_rank: string; // Assuming the enum comes as string
  } | null; // Use null if the relationship might not exist yet
}

interface MasterWorkout {
  id: string;
  name: string;
  description?: string;
  default_xp_reward: number;
}

interface ActiveMission {
  master_workout_id?: string | null; // Optional FK
  title: string; // Use title for matching if FK is null
}

interface MissionToInsert {
  user_id: string;
  title: string;
  description?: string | null;
  type: 'DAILY' | 'WEEKLY' | 'SEASONAL';
  xp_reward: number;
  master_workout_id?: string | null;
  assigned_at: string; // ISO String
  due_at: string; // ISO String
  is_completed: boolean;
}

// --- Configuration ---
const DAILY_MISSION_COUNT = 4;
const WEEKLY_MISSION_COUNT = 8;
const SEASONAL_MISSION_COUNT = 3;
// --- End Configuration ---


// --- GraphQL Operations ---
const GET_USERS_AND_STATS = gql`
  query GetUsersAndStats {
    users {
      id
      # Assumes 'stat' is the one-to-one relationship from auth.users to public.user_stats
      stat {
        level
        fitness_rank
      }
    }
  }
`;

const GET_MASTER_WORKOUTS_FOR_RANK = gql`
  query GetMasterWorkoutsForRank(
    $rank: fitness_rank_enum!,
    $level: Int!,
    $excludedIds: [uuid!] = [] # IDs of master workouts already assigned as active missions
  ) {
    master_workouts(where: {
      target_rank: {_eq: $rank},
      min_level: {_lte: $level},
      max_level: {_gte: $level},
      id: {_nin: $excludedIds} # Exclude already assigned ones
    }) {
      id
      name
      description
      default_xp_reward
    }
  }
`;

const GET_ACTIVE_MISSIONS_FOR_USER = gql`
  query GetActiveMissionsForUser($userId: uuid!, $missionType: mission_type_enum!, $currentDateStartOfDay: timestamptz!) {
    missions(where: {
      user_id: {_eq: $userId},
      type: {_eq: $missionType},
      is_completed: {_eq: false},
      due_at: {_gte: $currentDateStartOfDay}
    }) {
      master_workout_id # Get the FK
      title             # Fallback if FK is null
    }
  }
`;


const INSERT_MISSIONS = gql`
  mutation InsertMissions($objects: [missions_insert_input!]!) {
    insert_missions(objects: $objects) {
      affected_rows
      returning {
        id
        user_id
        title
        type
      }
    }
  }
`;
// --- End GraphQL Operations ---


// --- Helper Functions ---
function getDueDate(type: 'DAILY' | 'WEEKLY' | 'SEASONAL'): string {
    const now = new Date();
    let dueDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); // Start of today UTC

    if (type === 'DAILY') {
        dueDate.setUTCDate(dueDate.getUTCDate() + 1); // Due end of today UTC
        dueDate.setUTCHours(0, 0, 0, -1); // Set to 23:59:59.999 of today
    } else if (type === 'WEEKLY') {
        const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday,...
        const diffToEndOfWeek = dayOfWeek === 0 ? 0 : 7 - dayOfWeek; // Days until next Sunday
        dueDate.setUTCDate(dueDate.getUTCDate() + diffToEndOfWeek);
        dueDate.setUTCHours(23, 59, 59, 999); // End of Sunday UTC
    } else if (type === 'SEASONAL') {
        // Example: End of current quarter
        const currentMonth = now.getUTCMonth(); // 0-11
        const quarterEndMonth = Math.floor(currentMonth / 3) * 3 + 2; // 2, 5, 8, 11
        dueDate = new Date(Date.UTC(now.getUTCFullYear(), quarterEndMonth + 1, 0, 23, 59, 59, 999)); // Last day of quarter end month
    }
    return dueDate.toISOString();
}

// Function to shuffle an array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// --- End Helper Functions ---


// --- Main Function Logic ---
export default async (req: Request, res: Response) => {

    // --- Security Check (Optional but Recommended for Cron) ---
    // You might want to add a secret header check if triggering via webhook/cron
    // const CRON_SECRET = process.env.CRON_SECRET;
    // if (req.headers['x-cron-secret'] !== CRON_SECRET) {
    //     console.warn('Unauthorized cron trigger attempt.');
    //     return res.status(401).send('Unauthorized');
    // }
    // --- End Security Check ---


    // --- Initialize Nhost Admin Client ---
    // Ensure NHOST_BACKEND_URL and NHOST_ADMIN_SECRET are set in environment variables
    const nhostParams: NhostClientConstructorParams = {
        backendUrl: process.env.NHOST_BACKEND_URL,
        adminSecret: process.env.NHOST_ADMIN_SECRET,
    };

    if (!nhostParams.backendUrl || !nhostParams.adminSecret) {
        console.error('Missing NHOST_BACKEND_URL or NHOST_ADMIN_SECRET environment variables.');
        return res.status(500).send('Internal Server Error: Missing configuration.');
    }

    const nhost = new NhostClient(nhostParams);
    // --- End Initialize Nhost Admin Client ---

    const missionTypeToGenerate: 'DAILY' | 'WEEKLY' | 'SEASONAL' = 'DAILY'; // CHANGE THIS based on cron schedule (e.g., read from req body/query if webhook)
    const missionCount = missionTypeToGenerate === 'DAILY' ? DAILY_MISSION_COUNT :
                         missionTypeToGenerate === 'WEEKLY' ? WEEKLY_MISSION_COUNT :
                         SEASONAL_MISSION_COUNT;

    console.log(`Starting mission generation for type: ${missionTypeToGenerate}`);

    try {
        // 1. Fetch all users and their stats
        const usersResult = await nhost.graphql.request<{ users: UserWithStats[] }>(GET_USERS_AND_STATS);
        if (usersResult.error) throw usersResult.error;
        const users = usersResult.data?.users || [];
        console.log(`Found ${users.length} users to process.`);

        const allMissionsToInsert: MissionToInsert[] = [];
        const todayStartUTC = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())).toISOString();

        // 2. Process each user
        for (const user of users) {
            if (!user.stat) {
                console.warn(`User ${user.id} has no stats record, skipping mission generation.`);
                continue;
            }

            const { level, fitness_rank } = user.stat;

            // 3. Get user's currently active missions of this type to avoid duplicates
            const activeMissionsResult = await nhost.graphql.request<{ missions: ActiveMission[] }>(
                GET_ACTIVE_MISSIONS_FOR_USER,
                { userId: user.id, missionType: missionTypeToGenerate, currentDateStartOfDay: todayStartUTC }
            );
            if (activeMissionsResult.error) {
                console.error(`Error fetching active missions for user ${user.id}:`, activeMissionsResult.error);
                continue; // Skip this user if we can't check active missions
            }
            const activeMissions = activeMissionsResult.data?.missions || [];
            const excludedMasterWorkoutIds = activeMissions
                .map(m => m.master_workout_id)
                .filter((id): id is string => !!id); // Get IDs of active missions linked to master workouts

            console.log(`User ${user.id} (Rank: ${fitness_rank}, Level: ${level}) has ${activeMissions.length} active ${missionTypeToGenerate} missions. Excluding master IDs: ${excludedMasterWorkoutIds.join(', ')}`);

            // 4. Fetch suitable master workouts for this user, excluding active ones
            const masterWorkoutsResult = await nhost.graphql.request<{ master_workouts: MasterWorkout[] }>(
                GET_MASTER_WORKOUTS_FOR_RANK,
                { rank: fitness_rank, level: level, excludedIds: excludedMasterWorkoutIds }
            );
            if (masterWorkoutsResult.error) {
                console.error(`Error fetching master workouts for user ${user.id}:`, masterWorkoutsResult.error);
                continue; // Skip user if workouts can't be fetched
            }
            const availableWorkouts = masterWorkoutsResult.data?.master_workouts || [];

            if (availableWorkouts.length === 0) {
                console.log(`No suitable new master workouts found for user ${user.id} (Rank ${fitness_rank}, Level ${level}).`);
                continue;
            }

            // 5. Select random workouts and prepare mission objects
            const shuffledWorkouts = shuffleArray(availableWorkouts);
            const selectedWorkouts = shuffledWorkouts.slice(0, missionCount); // Select up to the required count

            const newMissionsForUser: MissionToInsert[] = selectedWorkouts.map(workout => ({
                user_id: user.id,
                title: workout.name,
                description: workout.description,
                type: missionTypeToGenerate,
                xp_reward: workout.default_xp_reward,
                master_workout_id: workout.id, // Link to the master workout
                assigned_at: new Date().toISOString(),
                due_at: getDueDate(missionTypeToGenerate),
                is_completed: false,
            }));

            allMissionsToInsert.push(...newMissionsForUser);
            console.log(`Prepared ${newMissionsForUser.length} new ${missionTypeToGenerate} missions for user ${user.id}.`);
        } // End user loop

        // 6. Bulk insert all prepared missions
        if (allMissionsToInsert.length > 0) {
            console.log(`Attempting to insert ${allMissionsToInsert.length} missions in total.`);
            const insertResult = await nhost.graphql.request(INSERT_MISSIONS, { objects: allMissionsToInsert });
            if (insertResult.error) {
                console.error('Error inserting missions:', insertResult.error);
                throw insertResult.error; // Throw to signal failure
            }
            console.log(`Successfully inserted ${insertResult.data?.insert_missions?.affected_rows || 0} missions.`);
        } else {
            console.log('No new missions needed to be inserted.');
        }

        return res.status(200).send(`Mission generation (${missionTypeToGenerate}) completed successfully.`);

    } catch (error: any) {
        console.error('Mission generation failed:', error);
        return res.status(500).send(`Internal Server Error: ${error.message || 'Unknown error'}`);
    }
};
