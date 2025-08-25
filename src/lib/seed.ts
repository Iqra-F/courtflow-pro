import { supabase } from '@/integrations/supabase/client';
import { ADMIN_CREDENTIALS } from '@/config/admin';

export async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', ADMIN_CREDENTIALS.email)
      .single();

    if (!existingAdmin) {
      // Create admin auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password,
        email_confirm: true,
      });

      if (authError) {
        console.error('Error creating admin auth user:', authError);
        return;
      }

      if (authData.user) {
        // Create admin profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            auth_user_id: authData.user.id,
            username: 'admin',
            email: ADMIN_CREDENTIALS.email,
            role: 'ADMIN',
          });

        if (profileError) {
          console.error('Error creating admin profile:', profileError);
          return;
        }

        console.log('Admin user created successfully');
      }
    } else {
      console.log('Admin user already exists');
    }

    // Create sample system settings
    const { error: settingsError } = await supabase
      .from('system_settings')
      .upsert([
        {
          key: 'file_upload_settings',
          value: {
            allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'],
            maxFileSize: 25 * 1024 * 1024,
          },
        },
        {
          key: 'public_filing_types',
          value: {
            types: ['Small Claims Request', 'Public Records Request', 'Civil Complaint'],
          },
        },
        {
          key: 'courtrooms',
          value: {
            rooms: ['Courtroom A', 'Courtroom B', 'Courtroom C', 'Courtroom D'],
          },
        },
        {
          key: 'working_hours',
          value: {
            start: '08:00',
            end: '17:00',
            timezone: 'America/New_York',
          },
        },
      ], { onConflict: 'key' });

    if (settingsError) {
      console.error('Error creating system settings:', settingsError);
    } else {
      console.log('System settings created successfully');
    }

    // Create sample users for development
    const sampleUsers = [
      {
        username: 'judge_smith',
        email: 'judge.smith@court.local',
        role: 'JUDGE',
        password: 'JudgePass123!',
      },
      {
        username: 'clerk_jones',
        email: 'clerk.jones@court.local',
        role: 'CLERK',
        password: 'ClerkPass123!',
      },
      {
        username: 'attorney_brown',
        email: 'attorney.brown@lawfirm.com',
        role: 'ATTORNEY',
        password: 'AttorneyPass123!',
      },
      {
        username: 'public_user',
        email: 'john.doe@email.com',
        role: 'PUBLIC',
        password: 'PublicPass123!',
      },
    ];

    for (const user of sampleUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

        if (authError) {
          console.error(`Error creating auth user for ${user.email}:`, authError);
          continue;
        }

        if (authData.user) {
          // Create user profile
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              auth_user_id: authData.user.id,
              username: user.username,
              email: user.email,
              role: user.role as any,
            });

          if (profileError) {
            console.error(`Error creating profile for ${user.email}:`, profileError);
          } else {
            console.log(`Created user: ${user.email}`);
          }
        }
      }
    }

    console.log('Database seed completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Auto-run seed when this module is imported in development
if (process.env.NODE_ENV === 'development') {
  // Run seed after a short delay to ensure Supabase is ready
  setTimeout(seedDatabase, 2000);
}