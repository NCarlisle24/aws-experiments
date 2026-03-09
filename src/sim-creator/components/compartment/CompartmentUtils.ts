export const DEFAULT_COMPARTMENT_STYLE: React.CSSProperties = {
    minHeight: "70px",
    minWidth: "110px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "var(--color-compartment)",
    borderColor: "var(--color-compartment-border)",
    textAlign: "center",
    color: "black",
    borderRadius: "10px",
    borderWidth: "1px",
    userSelect: "none"
} as const;

export const getMousePos = (e: MouseEvent | React.MouseEvent): { x: number, y: number } => {
    return { x: e.clientX, y: e.clientY };
}