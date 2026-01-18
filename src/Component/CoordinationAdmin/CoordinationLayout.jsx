import CoordinationSidebar from "./CoordinationSidebar";
import CoordinationHeader from "./CoordinationHeader";
import { useLanguage } from "../../context/LanguageContext";

const CoordinationLayout = ({ children }) => {
  const { isRTL } = useLanguage();

  return (
    <div style={{ display: "flex" }} dir={isRTL ? "rtl" : "ltr"}>
      <CoordinationSidebar />

      <div style={{
        marginLeft: isRTL ? 0 : 240,
        marginRight: isRTL ? 240 : 0,
        width: "100%"
      }}>
        <CoordinationHeader />
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

export default CoordinationLayout;
