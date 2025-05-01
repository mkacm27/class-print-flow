
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: number;
  className?: string;
  onClick?: () => void;
}

const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  onClick,
}: StatsCardProps) => {
  return (
    <Card 
      className={cn("overflow-hidden card-hover", 
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </div>
        {icon && (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
        {typeof trend === 'number' && (
          <div className={cn(
            "text-xs font-medium mt-2 inline-flex items-center",
            trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-gray-500"
          )}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StatsCard;
