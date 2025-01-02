export const metadata = {
  title: "Home",
  description: "Home Page",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
