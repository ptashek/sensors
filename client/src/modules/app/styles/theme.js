import 'typeface-roboto';
import colors from '@workday/canvas-colors-web';
import { createMuiTheme, getContrastText, responsiveFontSizes } from '@material-ui/core/styles';

const theme: Theme = createMuiTheme({
  palette: {
    primary: {
      light: colors.cappuccino200,
      main: colors.cappuccino400,
      dark: colors.cappuccino600,
    },
    secondary: {
      light: colors.coconut200,
      main: colors.coconut400,
      dark: colors.coconut600,
    },
    error: {
      light: colors.cinnamon400,
      main: colors.cinnamon500,
      dark: colors.cinnamon600,
    },
    colors,
  },
});

export default responsiveFontSizes(theme);
