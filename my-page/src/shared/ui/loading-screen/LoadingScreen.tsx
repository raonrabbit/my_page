export default function LoadingScreen() {
  return (
    <div
      className={`fixed inset-0 w-full h-full flex items-center justify-center z-[9999]`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="text-center animate-fade-out-down">
        <h1 className="text-4xl font-bold text-blue-400 text-shadow-lg mb-4 p-4">
          Welcome...
        </h1>
      </div>
    </div>
  );
}
