import { googleAuthService } from "./child-services/google-auth.service.js";
import { localAuthService } from "./child-services/local-auth.service.js";


export const authService = {
  ...localAuthService,
  signUp: (...args: Parameters<typeof localAuthService.signUp>) => localAuthService.signUp(...args),
  signIn: (...args: Parameters<typeof localAuthService.signIn>) => localAuthService.signIn(...args),
  signInWithGoogle: (...args: Parameters<typeof googleAuthService.signInWithGoogle>) =>
    googleAuthService.signInWithGoogle(...args),
};
