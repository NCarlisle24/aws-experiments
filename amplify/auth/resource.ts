import { defineAuth } from '@aws-amplify/backend';
import { USER_GROUPS } from '../data/groups';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: [
    USER_GROUPS.ADMIN,
    USER_GROUPS.VIEWER
  ]
});
