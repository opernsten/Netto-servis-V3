export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
      {/* Animovaný spinner */}
      <div className="w-16 h-16 border-4 border-blue-200 border-t-[#0f2c59] rounded-full animate-spin mb-6"></div>
      
      {/* Nápis */}
      <div className="text-xl font-extrabold tracking-tight text-[#0f2c59] animate-pulse">
        NETTO <span className="text-blue-500">SERVIS</span>
      </div>
      <p className="text-gray-500 text-sm mt-2 font-medium">
        Načítání systému...
      </p>
    </div>
  );
}