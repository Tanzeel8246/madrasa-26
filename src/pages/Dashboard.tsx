import { Users, GraduationCap, BookOpen, ClipboardCheck } from "lucide-react";
import StatsCard from "@/components/Dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useStudents } from "@/hooks/useStudents";
import { useTeachers } from "@/hooks/useTeachers";
import { useClasses } from "@/hooks/useClasses";
import { useAttendance } from "@/hooks/useAttendance";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { students } = useStudents();
  const { teachers } = useTeachers();
  const { classes } = useClasses();
  const { attendance } = useAttendance();

  // Calculate real statistics
  const totalStudents = students?.length || 0;
  const activeStudents = students?.filter(s => s.status === 'active').length || 0;
  const totalTeachers = teachers?.length || 0;
  const totalClasses = classes?.length || 0;
  
  // Calculate today's attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance?.filter(a => a.date === today) || [];
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const attendanceRate = todayAttendance.length > 0 
    ? Math.round((presentToday / todayAttendance.length) * 100) 
    : 0;

  const stats = [
    {
      title: t('totalStudents'),
      value: totalStudents.toString(),
      icon: Users,
      trend: { value: `${activeStudents} ${t('activeStudents').toLowerCase()}`, isPositive: true },
    },
    {
      title: t('totalTeachers'),
      value: totalTeachers.toString(),
      icon: GraduationCap,
      trend: { value: "", isPositive: true },
    },
    {
      title: t('totalClasses'),
      value: totalClasses.toString(),
      icon: BookOpen,
      trend: { value: "", isPositive: true },
    },
    {
      title: t('todayAttendance'),
      value: `${attendanceRate}%`,
      icon: ClipboardCheck,
      trend: { value: `${presentToday}/${todayAttendance.length} ${t('present').toLowerCase()}`, isPositive: true },
    },
  ];

  const recentActivities = [
    { id: 1, title: "New student registered", time: "2 hours ago", type: "student" },
    { id: 2, title: "Quran class completed", time: "4 hours ago", type: "class" },
    { id: 3, title: "Attendance marked for Class 5A", time: "6 hours ago", type: "attendance" },
    { id: 4, title: "New teacher assigned", time: "1 day ago", type: "teacher" },
  ];

  const upcomingClasses = [
    { id: 1, name: "Quran Recitation", time: "9:00 AM", teacher: "Ustadh Ahmed", students: 24 },
    { id: 2, name: "Arabic Grammar", time: "11:00 AM", teacher: "Ustadha Fatima", students: 18 },
    { id: 3, name: "Islamic History", time: "2:00 PM", teacher: "Ustadh Ibrahim", students: 22 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base">{t('overview')}</p>
      </div>

      {/* Quick Actions - Moved to top */}
      <Card className="shadow-elevated">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Button className="h-auto flex-col gap-1 sm:gap-2 py-3 sm:py-4" variant="outline" onClick={() => navigate('/students')}>
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-[10px] sm:text-xs md:text-sm">Add Student</span>
            </Button>
            <Button className="h-auto flex-col gap-1 sm:gap-2 py-3 sm:py-4" variant="outline" onClick={() => navigate('/teachers')}>
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-[10px] sm:text-xs md:text-sm">Add Teacher</span>
            </Button>
            <Button className="h-auto flex-col gap-1 sm:gap-2 py-3 sm:py-4" variant="outline" onClick={() => navigate('/classes')}>
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-[10px] sm:text-xs md:text-sm">Create Class</span>
            </Button>
            <Button className="h-auto flex-col gap-1 sm:gap-2 py-3 sm:py-4" variant="outline" onClick={() => navigate('/attendance')}>
              <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-[10px] sm:text-xs md:text-sm">Mark Attendance</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Upcoming Classes */}
        <Card className="shadow-elevated">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Upcoming Classes</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Today's schedule overview</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {upcomingClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 sm:p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base truncate">{classItem.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {classItem.teacher} • {classItem.students} students
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs sm:text-sm font-medium text-primary whitespace-nowrap">{classItem.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-3 sm:mt-4 w-full text-xs sm:text-sm" variant="outline" onClick={() => navigate('/classes')}>
              View All Classes
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-elevated">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest updates and actions</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-2 sm:gap-3 rounded-lg border border-border p-3 sm:p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-3 sm:mt-4 w-full text-xs sm:text-sm" variant="outline" onClick={() => navigate('/students')}>
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
