import { useState, useEffect, useCallback } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Minimize, CropSquare, FilterNone, Close as CloseIcon } from "@mui/icons-material";
import BlurCircularIcon from "@mui/icons-material/BlurCircular";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "../titlebar.css";

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    appWindow.isMaximized().then(setIsMaximized);
    const unlisten = appWindow.onResized(() => {
      appWindow.isMaximized().then(setIsMaximized);
    });
    return () => { unlisten.then(fn => fn()); };
  }, [appWindow]);

  const handleMinimize = useCallback(() => appWindow.minimize(), [appWindow]);
  const handleToggleMaximize = useCallback(async () => {
    await appWindow.toggleMaximize();
    setIsMaximized(await appWindow.isMaximized());
  }, [appWindow]);
  const handleClose = useCallback(() => appWindow.close(), [appWindow]);

  return (
    <Box
      sx={{
        height: 32,
        display: "flex",
        alignItems: "center",
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "#1e1e1e",
        userSelect: "none",
      }}
    >
      <Box
        className="titlebar-drag"
        sx={{
          flex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          pl: 2,
          gap: 1,
        }}
        onDoubleClick={handleToggleMaximize}
      >
        <BlurCircularIcon sx={{ fontSize: 16, color: "#4fc3f7" }} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          OpenT Poincare Sphere Simulator
        </Typography>
      </Box>

      <Box className="titlebar-no-drag" sx={{ display: "flex", height: "100%" }}>
        <IconButton
          size="small"
          onClick={handleMinimize}
          sx={{ borderRadius: 0, width: 40, height: "100%", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
        >
          <Minimize sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleToggleMaximize}
          sx={{ borderRadius: 0, width: 40, height: "100%", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
        >
          {isMaximized ? <FilterNone sx={{ fontSize: 14 }} /> : <CropSquare sx={{ fontSize: 14 }} />}
        </IconButton>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ borderRadius: 0, width: 40, height: "100%", "&:hover": { bgcolor: "#c42b1c" } }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
