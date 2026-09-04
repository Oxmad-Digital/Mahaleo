export default function AdminLayout({ children, modal }: LayoutProps<"/admin">) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
