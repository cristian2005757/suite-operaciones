import Sidebar from "./sidebar";

export default function AppLayout({ children }) {
  return (
    <div style={styles.bg}>
      <div style={styles.wrap}>
        <Sidebar />
        <main style={styles.main}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    background: "#0b0b0f",
    color: "white",
  },
  wrap: {
    display: "flex",
  },
  main: {
    flex: 1,
    padding: 24,
  },
};
