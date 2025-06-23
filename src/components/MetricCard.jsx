export default function MetricCard({ label, value, change, changeType, icon, color, description }) {
  const getColorClasses = (color) => {
    switch (color) {
      case 'green':
        return {
          bg: 'from-green-500/20 to-green-600/20',
          border: 'border-green-500/30',
          text: 'text-green-400',
          iconBg: 'bg-green-500/20'
        };
      case 'blue':
        return {
          bg: 'from-blue-500/20 to-blue-600/20',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          iconBg: 'bg-blue-500/20'
        };
      case 'orange':
        return {
          bg: 'from-orange-500/20 to-orange-600/20',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          iconBg: 'bg-orange-500/20'
        };
      case 'purple':
        return {
          bg: 'from-purple-500/20 to-purple-600/20',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          iconBg: 'bg-purple-500/20'
        };
      default:
        return {
          bg: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          iconBg: 'bg-gray-500/20'
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <div className={`bg-gradient-to-br ${colors.bg} backdrop-blur-xl rounded-2xl p-6 border ${colors.border} hover:shadow-lg hover:border-opacity-50 hover:scale-[1.02] transition-all duration-200 cursor-pointer group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            changeType === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <span>{changeType === 'positive' ? '↗' : '↘'}</span>
            {change}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-gray-300 text-sm font-medium uppercase tracking-wide">{label}</h3>
        <div className="text-3xl font-bold text-white">
          {value}
        </div>
        {description && (
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
} 