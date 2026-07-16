import React from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { useLmsStore } from '../../store/useLmsStore';

export const DeadlinesList: React.FC = () => {
  const { modules, courses } = useLmsStore();

  // We can construct mock deadlines based on Go/Math modules
  // In a real system, these would be fetched from database
  const deadlines = [
    {
      id: 'dl-1',
      lessonId: 'lesson-2-uuid', // Урок 2. Структуры, массивы и слайсы
      courseId: 'go-course-uuid',
      daysLeft: 2,
      hoursLeft: 4,
      requiredAction: 'Сдать тест и конспект',
      isOverdue: false
    },
    {
      id: 'dl-2',
      lessonId: 'lesson-1-math-uuid', // Урок 1. Предел функции
      courseId: 'math-course-uuid',
      daysLeft: 4,
      hoursLeft: 12,
      requiredAction: 'Пройти тест урока',
      isOverdue: false
    },
    {
      id: 'dl-3',
      lessonId: 'lesson-3-uuid', // Урок 3. Указатели
      courseId: 'go-course-uuid',
      daysLeft: 7,
      hoursLeft: 0,
      requiredAction: 'Открыть урок',
      isOverdue: false
    }
  ];

  const getLessonTitle = (lessonId: string) => {
    for (const mod of modules) {
      const les = mod.lessons.find(l => l.id === lessonId);
      if (les) return les.title;
    }
    return 'Урок';
  };

  const getCourseBadgeColor = (courseId: string) => {
    return courseId === 'go-course-uuid' 
      ? 'bg-blue-50 text-blue-600 border-blue-100' 
      : 'bg-indigo-50 text-indigo-600 border-indigo-100';
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title.split(' ')[0] : 'Курс'; // e.g. "Основы" or "Математический" -> shorten
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 border-b border-zinc-50 pb-3">
        <Clock className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-black text-zinc-900 font-outfit">Ближайшие дедлайны</h3>
      </div>

      <div className="space-y-3">
        {deadlines.map((item) => {
          const lessonTitle = getLessonTitle(item.lessonId);
          const courseLabel = getCourseTitle(item.courseId);
          const badgeStyle = getCourseBadgeColor(item.courseId);
          
          return (
            <div 
              key={item.id} 
              className="flex items-start justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-xl hover:border-zinc-200 transition-all"
            >
              <div className="space-y-1.5 min-w-0 flex-1 mr-3">
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 border rounded-full ${badgeStyle}`}>
                    {courseLabel}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">{item.requiredAction}</span>
                </div>
                
                <h4 className="text-xs font-bold text-zinc-800 font-outfit truncate">
                  {lessonTitle}
                </h4>
              </div>

              {/* Timer tag */}
              <div className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border flex-shrink-0 ${
                item.daysLeft <= 2 
                  ? 'bg-rose-50 text-rose-600 border-rose-100 font-extrabold' 
                  : 'bg-amber-50/50 text-amber-600 border-amber-100/50 font-bold'
              }`}>
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[10px]">
                  {item.daysLeft > 0 ? `${item.daysLeft}д ` : ''}
                  {item.hoursLeft > 0 ? `${item.hoursLeft}ч` : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
