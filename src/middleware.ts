import { authMiddleware, currentUser, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
    async afterAuth(auth, req, evt) {
        if (!auth.userId && !auth.isPublicRoute) {
            return redirectToSignIn({ returnBackUrl: req.url });
        }
    }
});

export const config = {
    matcher: ["/(api|trpc)(.*)", "/buy", "/dashboard"],
};
