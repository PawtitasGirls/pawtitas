import { colors } from '../../../shared/styles';

export const CALENDARIO_CONFIG = {
  YEARS_IN_FUTURE: 100,
  MONTH_NAMES: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  FIRST_DAY_OF_WEEK: 1, // Lunes
};

export class CalendarioPagoController {
  // Rango de fechas
  static getDateRange() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + CALENDARIO_CONFIG.YEARS_IN_FUTURE);

    return {
      minDate: today.toISOString().split('T')[0],
      maxDate: maxDate.toISOString().split('T')[0]
    };
  }

  // Fecha seleccionada
  static createSelectedDateObject() {
    return {
      selected: true,
      marked: true,
      selectedColor: colors.primaryDark
    };
  }

  // Selección de fecha
  static toggleDateSelection(currentDates, dateString) {
    if (currentDates[dateString]) {
      return {};
    }
    return { [dateString]: this.createSelectedDateObject() };
  }

  // Fechas seleccionadas
  static hasSelectedDates(selectedDates) {
    return Object.keys(selectedDates).length > 0;
  }

  // Array de fechas seleccionadas
  static getSelectedDatesArray(selectedDates) {
    return Object.keys(selectedDates);
  }

  // Conteo de fechas seleccionadas
  static countSelectedDates(selectedDates) {
    return Object.keys(selectedDates).length;
  }

  // Tema del calendario
  static getCalendarTheme() {
    return {
      backgroundColor: colors.surface,
      calendarBackground: colors.surface,
      textSectionTitleColor: colors.text.secondary,
      selectedDayBackgroundColor: colors.primaryDark,
      selectedDayTextColor: '#ffffff',
      todayTextColor: colors.primary,
      dayTextColor: colors.text.primary,
      textDisabledColor: colors.text.disabled,
      dotColor: colors.primaryDark,
      selectedDotColor: '#ffffff',
      arrowColor: colors.primaryDark,
      monthTextColor: colors.text.primary,
      indicatorColor: colors.primaryDark,
      textDayFontSize: 15,
      textMonthFontSize: 17,
      textDayHeaderFontSize: 13,
      'stylesheet.calendar.header': {
        week: {
          marginTop: 5,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }
      }
    };
  }

  // Header
  static formatCalendarHeader(date) {
    const month = CALENDARIO_CONFIG.MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  }

  // Configuración
  static getCalendarConfig() {
    return {
      monthFormat: 'MMMM yyyy',
      hideExtraDays: true,
      disableMonthChange: false,
      firstDay: CALENDARIO_CONFIG.FIRST_DAY_OF_WEEK,
      hideDayNames: false,
      showWeekNumbers: false,
      disableAllTouchEventsForDisabledDays: true
    };
  }

  // Fecha válida
  static isValidDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  // Fechas ordenadas
  static sortSelectedDates(dates) {
    return dates.sort((a, b) => new Date(a) - new Date(b));
  }

  // Mostrar fecha
  static formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = CALENDARIO_CONFIG.MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  }
}

