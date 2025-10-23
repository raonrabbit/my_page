export default function LoadingScreen() {
  return (
    <div
      className={`fixed inset-0 bg-black w-screen flex items-center justify-center z-50`}
    >
      <div className="text-center">
        <h1 className="text-4xl font-light text-white mb-4">Welcome</h1>
      </div>
    </div>
  );
}
