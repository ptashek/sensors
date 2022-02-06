import 'typeface-roboto';
import canvasColors from '@workday/canvas-colors-web';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: canvasColors.cappuccino200,
      main: canvasColors.cappuccino400,
      dark: canvasColors.cappuccino600,
    },
    secondary: {
      light: canvasColors.coconut200,
      main: canvasColors.coconut400,
      dark: canvasColors.coconut600,
    },
    error: {
      light: canvasColors.cinnamon400,
      main: canvasColors.cinnamon500,
      dark: canvasColors.cinnamon600,
    },
    colors: canvasColors,
  },
});

export default responsiveFontSizes(theme);
