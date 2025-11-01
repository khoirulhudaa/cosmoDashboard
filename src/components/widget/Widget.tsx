import Card from "components/card";
import React from "react";

const Widget = (props: {
  icon: JSX.Element;
  title: string;
  subtitle: string | number;
  extraClass?: string;
  extra?: React.ReactNode; // Tambahan konten (tombol, badge, dll)
}) => {
  const { icon, title, subtitle, extraClass = "", extra } = props;

  return (
    <Card
      extra={`!flex-row flex-grow items-center rounded-[20px] p-4 ${extraClass}`}
    >
      {/* Icon */}
      <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-lightPrimary dark:bg-navy-700">
        <span className="text-brand-500 dark:text-white">{icon}</span>
      </div>

      {/* Text */}
      <div className="ml-4 flex flex-col justify-center flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          {subtitle}
        </h4>
      </div>

      {/* Extra (tombol, badge, dll) */}
      {extra && (
        <div className="ml-auto flex items-center">
          {extra}
        </div>
      )}
    </Card>
  );
};

export default Widget;