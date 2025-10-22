export default function Projects() {
  return (
    <div className="flex-col w-full justify-items-end font-light pt-2">
      <div>
        <h1 className="text-2xl font-light mb-8">Projects</h1>
        <div className="space-y-6">
          <div className="border-l-2 border-blue-500 pl-4">
            <h3 className="text-lg font-medium">Project 1</h3>
            <p className="text-sm text-gray-600">Next.js, Three.js</p>
          </div>
          <div className="border-l-2 border-blue-500 pl-4">
            <h3 className="text-lg font-medium">Project 2</h3>
            <p className="text-sm text-gray-600">React, TypeScript, Tailwind CSS</p>
          </div>
          <div className="border-l-2 border-blue-500 pl-4">
            <h3 className="text-lg font-medium">Project 3</h3>
            <p className="text-sm text-gray-600">Vue.js, Node.js</p>
          </div>
        </div>
      </div>
    </div>
  );
}
