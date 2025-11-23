"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  useCurrentUser,
  useIsSignedIn,
  useSignInWithEmail,
  useVerifyEmailOTP,
  useSignInWithOAuth,
  useSignOut,
} from "@coinbase/cdp-hooks";

export default function Home() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { isSignedIn } = useIsSignedIn();
  const { signInWithEmail } = useSignInWithEmail();
  const { verifyEmailOTP } = useVerifyEmailOTP();
  const { signInWithOAuth } = useSignInWithOAuth();
  const { signOut } = useSignOut();
  
  const [authStep, setAuthStep] = useState<"method" | "email" | "otp">("method");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [flowId, setFlowId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const address = currentUser?.evmAccounts?.[0];

  // Redirect to series if signed in
  useEffect(() => {
    if (isSignedIn && address) {
      router.push("/series");
    }
  }, [isSignedIn, address, router]);

  // Handle email sign in
  const handleEmailSignIn = async () => {
    if (!email) return;
    
    setLoading(true);
    setError("");
    
    try {
      const result = await signInWithEmail({ email });
      setFlowId(result.flowId);
      setAuthStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!otp || !flowId) return;
    
    setLoading(true);
    setError("");
    
    try {
      await verifyEmailOTP({ flowId, otp });
      setAuthStep("method");
      setEmail("");
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código OTP inválido");
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth sign in
  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setLoading(true);
    setError("");
    
    try {
      await signInWithOAuth(provider);
      setAuthStep("method");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setAuthStep("method");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // If user is signed in, show the main app
  if (isSignedIn && address) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="border-b border-purple-900/50 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              🎭 Cryptoon
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-purple-300">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Bienvenido a Cryptoon
            </h2>
            <p className="text-gray-400 text-lg mb-8">
             Tu sitio favorito de mangas y webtoons.
            </p>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-purple-300">
                Tu wallet está conectada ✨
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Auth UI
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            🎭 Cryptoon
          </h1>
          <p className="text-gray-400">Support with crypto to your favorite artists</p>
        </div>

        {/* Auth Card */}
        <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {authStep === "method" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>
              
              {/* OAuth Buttons */}
              <button
                onClick={() => handleOAuthSignIn("google")}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-black font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-500/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-gray-400">o</span>
                </div>
              </div>

              {/* Email Button */}
              <button
                onClick={() => setAuthStep("email")}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Continuar con Email
              </button>
            </div>
          )}

          {authStep === "email" && (
            <div className="space-y-4">
              <button
                onClick={() => setAuthStep("method")}
                className="text-purple-400 hover:text-purple-300 text-sm mb-4"
              >
                ← Volver
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6">Ingresa tu email</h2>
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-black border border-purple-500/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                onKeyPress={(e) => e.key === "Enter" && handleEmailSignIn()}
              />
              
              <button
                onClick={handleEmailSignIn}
                disabled={loading || !email}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar Código"}
              </button>
            </div>
          )}

          {authStep === "otp" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-2">Verifica tu email</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enviamos un código a {email}
              </p>
              
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 bg-black border border-purple-500/50 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:border-purple-500"
                onKeyPress={(e) => e.key === "Enter" && handleVerifyOTP()}
              />
              
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Verificando..." : "Verificar"}
              </button>

              <button
                onClick={() => {
                  setAuthStep("email");
                  setOtp("");
                }}
                className="w-full text-purple-400 hover:text-purple-300 text-sm"
              >
                Reenviar código
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Al continuar, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}

