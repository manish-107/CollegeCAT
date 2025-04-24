export default function Background() {
    return (
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800 opacity-90" />
        <div className="absolute -inset-10 bg-gradient-radial from-purple-600/20 via-transparent to-transparent rounded-full w-full h-full blur-3xl" />
      </div>
    );
  }
  