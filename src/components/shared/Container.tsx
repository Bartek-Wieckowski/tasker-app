import React from "react";

type ContainerProps = {
  children: React.ReactNode;
  "data-testid"?: string;
};

export default function Container({
  children,
  "data-testid": dataTestId,
}: ContainerProps) {
  return (
    <div className="max-w-2xl w-full mx-auto" data-testid={dataTestId}>
      {children}
    </div>
  );
}
