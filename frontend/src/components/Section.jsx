const Section = ({ title, children }) => {
  return (
    <section style={{ paddingLeft: "16px", paddingRight: "16px" }}>
      <h2 style={{ marginBottom: "16px" }}>{title}</h2>
      {children}
    </section>
  );
};

export default Section;
