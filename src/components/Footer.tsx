export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">班级抽奖系统</h3>
            <p className="text-gray-400 mt-2">一个简单而有趣的班级抽奖平台</p>
          </div>
          
          <div className="text-center md:text-right">
            <p>&copy; {new Date().getFullYear()} 班级抽奖系统</p>
            <p className="text-gray-400 mt-1">保留所有权利</p>
          </div>
        </div>
      </div>
    </footer>
  );
} 