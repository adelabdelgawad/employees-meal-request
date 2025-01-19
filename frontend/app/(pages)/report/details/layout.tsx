'use client';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div>
        <span className="text-2xl font-bold m-5">Details Report</span>
        <div className="h-px bg-gray-200 mt-5"></div>
      </div>
      {children}
    </div>
  );
}
