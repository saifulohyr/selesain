import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Suspense } from "react";

export default function AuthControls({ ctaOnly = false }: { ctaOnly?: boolean }) {
  return (
    <Suspense
      fallback={
        <span className={ctaOnly ? "auth-fallback cta-fallback" : "auth-fallback"} />
      }
    >
      <Show when="signed-out">
        <div className={ctaOnly ? "auth-actions auth-actions-cta" : "auth-actions"}>
          {!ctaOnly && (
            <SignInButton mode="redirect">
              <button className="button button-quiet" type="button">
                Masuk
              </button>
            </SignInButton>
          )}
          <SignUpButton mode="redirect">
            <button className="button button-primary" type="button">
              Mulai gratis <span aria-hidden="true">↗</span>
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="user-control">
          <UserButton />
        </div>
      </Show>
    </Suspense>
  );
}
