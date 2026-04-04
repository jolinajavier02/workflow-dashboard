import { leadService } from './leadService'
import { authService } from './authService'
import { activityService } from './activityService'
import { notificationService } from './notificationService'
import { toast } from 'sonner'

export const migrationService = {
  async migrateAll() {
    try {
        console.log("Migration Started: Bridging Sandbox to Cloud...");
        
        // 1. Leads
        const sandboxLeads = JSON.parse(localStorage.getItem('demo_data_store_leads') || '[]')
        for (const lead of sandboxLeads) {
            const { id, ...cleanLead } = lead;
            await leadService.createLead(cleanLead);
        }
        
        // 2. Profiles (Users)
        const sandboxProfiles = JSON.parse(localStorage.getItem('demo_profiles_v2') || '[]')
        for (const profile of sandboxProfiles) {
            const { user_id, ...cleanProfile } = profile;
            try {
                await authService.createProfile({ ...cleanProfile, id: user_id });
            } catch (e) {
                console.warn(`Profile exists or error migrating user: ${profile.email}`);
            }
        }

        // 3. Activity Logging
        const sandboxActivities = JSON.parse(localStorage.getItem('demo_activities') || '[]')
        for (const activity of sandboxActivities) {
            delete (activity as any).id;
            await activityService.log(activity.user_profile, activity.action, activity.details);
        }

        toast.success("Sync Complete: Sandbox data is now LIVE globally!");
        return true;
    } catch (err: any) {
        toast.error("Bridge Error: " + err.message);
        throw err;
    }
  }
}
