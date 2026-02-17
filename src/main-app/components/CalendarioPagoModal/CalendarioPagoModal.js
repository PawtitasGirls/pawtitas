import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import GuardarCancelarBtn from '../buttons/GuardarCancelarBtn';
import { styles } from './CalendarioPagoModal.styles';
import { colors } from '../../../shared/styles';
import { CalendarioPagoController } from '../../controller';

// Calendario para selección de fechas de pago
const CalendarioPagoModal = ({ 
  visible, 
  onClose, 
  onConfirm,
  providerName = ''
}) => {
  const [selectedDates, setSelectedDates] = useState({});

  // Rango de fechas
  const dateRange = useMemo(() => CalendarioPagoController.getDateRange(), []);

  // Tema del calendario
  const calendarTheme = useMemo(() => CalendarioPagoController.getCalendarTheme(), []);

  // Configuración del calendario
  const calendarConfig = useMemo(() => CalendarioPagoController.getCalendarConfig(), []);

  // Conteo de fechas seleccionadas
  const selectedDatesCount = useMemo(
    () => CalendarioPagoController.countSelectedDates(selectedDates),
    [selectedDates]
  );

  // Manejar selección/deselección de fechas
  const handleDayPress = useCallback((day) => {
    setSelectedDates((prevDates) => 
      CalendarioPagoController.toggleDateSelection(prevDates, day.dateString)
    );
  }, []);

  // Limpiar selección al cerrar
  const handleClose = useCallback(() => {
    setSelectedDates({});
    onClose();
  }, [onClose]);

  // Confirmar selección
  const handleConfirm = useCallback(() => {
    if (!CalendarioPagoController.hasSelectedDates(selectedDates)) {
      return;
    }
    const dates = CalendarioPagoController.getSelectedDatesArray(selectedDates);
    onConfirm(dates);
    setSelectedDates({});
  }, [selectedDates, onConfirm]);

  // Header del calendario
  const renderCalendarHeader = useCallback((date) => {
    const headerText = CalendarioPagoController.formatCalendarHeader(date);
    return (
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarHeaderText}>{headerText}</Text>
      </View>
    );
  }, []);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={['down']}
      style={styles.modal}
      propagateSwipe
      avoidKeyboard
    >
      <View style={styles.container}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="calendar-outline" size={24} color={colors.primaryDark} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Seleccionar fechas de servicio</Text>
              {providerName && (
                <Text style={styles.subtitle}>Para: {providerName}</Text>
              )}
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <View style={styles.scrollContent}>
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionRow}>
                <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                <Text style={styles.instructionText}>
                Tener en cuenta los días y horarios disponibles del prestador. Podés consultarlos en la sección Precios y Horarios de su perfil.
                </Text>
              </View>
            </View>

            {/* Calendario */}
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={handleDayPress}
                markedDates={selectedDates}
                minDate={dateRange.minDate}
                maxDate={dateRange.maxDate}
                monthFormat={calendarConfig.monthFormat}
                hideExtraDays={calendarConfig.hideExtraDays}
                disableMonthChange={calendarConfig.disableMonthChange}
                firstDay={calendarConfig.firstDay}
                hideDayNames={calendarConfig.hideDayNames}
                showWeekNumbers={calendarConfig.showWeekNumbers}
                onPressArrowLeft={subtractMonth => subtractMonth()}
                onPressArrowRight={addMonth => addMonth()}
                disableArrowLeft={false}
                disableArrowRight={false}
                disableAllTouchEventsForDisabledDays={calendarConfig.disableAllTouchEventsForDisabledDays}
                renderHeader={renderCalendarHeader}
                theme={calendarTheme}
              />
            </View>
          </View>
        </ScrollView>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <GuardarCancelarBtn
            label="Pagar con Mercado Pago"
            onPress={handleConfirm}
            variant="primary"
            disabled={selectedDatesCount === 0}
            showCancel={true}
            cancelLabel="Cancelar"
            onCancel={handleClose}
          />
        </View>
      </View>
    </Modal>
  );
};

// Memoizar el componente
export default React.memo(CalendarioPagoModal);
