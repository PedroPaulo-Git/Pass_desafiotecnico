import React from "react";
import { Search, MapPin, Calendar, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

interface SupportLandingProps {
  onCreateClick?: () => void;
}

export const SupportLanding: React.FC<SupportLandingProps> = ({
  onCreateClick,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto text-center space-y-8 py-8 px-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col items-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
            {t.supportLanding.title.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="text-purple-600 dark:text-purple-400">
              {t.supportLanding.title.split(" ").slice(2).join(" ")}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            {t.supportLanding.subtitle}
          </p>
        </div>
      </div>
      <div className="space-y-6 max-w-2xl">
        <div className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          <p className="mb-4">{t.supportLanding.description1}</p>
          <p>{t.supportLanding.description2}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 bg-card border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">
                {t.supportLanding.smartSearch.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 text-left">
              {t.supportLanding.smartSearch.description}
            </p>
          </div>
          <div className="p-6 bg-card border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">
                {t.supportLanding.centralized.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 text-left">
              {t.supportLanding.centralized.description}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-6 bg-card border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">
                {t.supportLanding.dateControl.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 text-left">
              {t.supportLanding.dateControl.description}
            </p>
          </div>
          <div className="p-6 bg-card border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">
                {t.supportLanding.realTimeStatus.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 text-left">
              {t.supportLanding.realTimeStatus.description}
            </p>
          </div>
        </div>
        <div className="pt-6 border-t border-border/50">
          <p className="text-muted-foreground">
            💡 <strong>{t.supportLanding.tip.split(":")[0]}:</strong>{" "}
            {t.supportLanding.tip.split(":")[1]}
          </p>
        </div>
      </div>
    </div>
  );
};
