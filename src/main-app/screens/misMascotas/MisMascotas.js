import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './misMascotas.styles';
import { ScreenHeader, MenuInferior, FloatingAddBtn, MensajeFlotante, ConfirmacionDialogo as ConfirmacionDialogo, useNavbarHeight } from '../../components';
import { MascotaCard, EmptyMascotasList, MascotaFormModal } from './components';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMascotasByDuenio,
  createMascota,
  updateMascota,
  deleteMascota,
  uploadMascotaPhoto,
} from '../../services/api/apiMascota';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || '';

const MisMascotas = () => {
  const navigation = useNavigation();
  const navbarHeight = useNavbarHeight();
  const { user, updateUser } = useAuth();
  
  const [modalVisible, setModalVisible] = useState(false);

  const [editingMascota, setEditingMascota] = useState(null);
  
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showMensajeFlotante, setShowMensajeFlotante] = useState(false);
  
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [mascotaToDelete, setMascotaToDelete] = useState(null);
  
  const [mascotas, setMascotas] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMascotas();
  }, []);

  const loadMascotas = async () => {
    try {
      setLoading(true);
      // Obtener el ID del dueño desde el usuario autenticado
      const duenioId = user?.duenioId || user?.id;
      
      if (!duenioId) {
        setMessage({ 
          type: "error", 
          text: "No se pudo obtener el ID del usuario" 
        });
        setShowMensajeFlotante(true);
        return;
      }

      const response = await getMascotasByDuenio(duenioId);
      
      if (response.success && response.mascotas) {
        const mascotasMapeadas = response.mascotas.map(m => ({
          id: m.id,
          nombre: m.nombre,
          especie: m.tipo,
          raza: m.raza,
          edad: m.edad,
          edadUnidad: m.edadUnidad || 'años',
          genero: m.genero,
          condiciones: m.condiciones,
          infoAdicional: m.infoAdicional,
          padeceEnfermedad: m.condiciones?.includes('Enfermedad') || false,
          requiereMedicacion: m.condiciones?.includes('Medicamentos') || false,
          cuidadoEspecial: m.condiciones?.includes('Cuidado especial') || false,
          condicionEspecial: m.condiciones,
          avatarUri: m.photoUrl ? `${API_BASE}${m.photoUrl}?t=${Date.now()}` : null,
        }));
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H1',location:'MisMascotas.js:loadMascotas',message:'Mapeo avatarUri mascotas',data:{apiBase:API_BASE,hasMascotas:Boolean(response.mascotas?.length),samplePhotoUrl:response.mascotas?.[0]?.photoUrl || null,sampleAvatarUri:mascotasMapeadas?.[0]?.avatarUri || null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        setMascotas(mascotasMapeadas);
        updateUser({ petsCount: mascotasMapeadas.length });
      }
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      setMessage({ 
        type: "error", 
        text: error.message || "Error al cargar mascotas" 
      });
      setShowMensajeFlotante(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMascotaPress = (mascota) => {
    setEditingMascota(mascota);
    setModalVisible(true);
  };

  const handleAddMascota = () => {
    setEditingMascota(null);
    setModalVisible(true);
  };
  
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingMascota(null);
  };
  
  const handleSaveMascota = async (formData) => {
    try {
      const duenioId = user?.duenioId || user?.id;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H1',location:'MisMascotas.js:handleSaveMascota',message:'Inicio guardar mascota',data:{hasDuenioId:Boolean(duenioId),isEditing:Boolean(editingMascota?.id),hasAvatarAsset:Boolean(formData?.avatarAsset?.uri)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      
      if (!duenioId) {
        setMessage({ 
          type: "error", 
          text: "No se pudo obtener el ID del usuario" 
        });
        setShowMensajeFlotante(true);
        return;
      }

      // Datos para enviar a la API
      const mascotaData = {
        nombre: formData.nombre,
        tipo: formData.especie,
        raza: formData.raza,
        edad: parseInt(formData.edad, 10) || 0,
        edadUnidad: formData.edadUnidad || 'años',
        genero: formData.genero || 'No especificado',
        infoAdicional: formData.infoAdicional,
        condiciones: generateCondicionEspecial(formData),
        duenioId: duenioId,
      };

      const resolveMascotaPhotoMimeType = (asset) => {
        const raw = (asset?.mimeType || '').toLowerCase();
        if (raw === 'image/jpeg' || raw === 'image/png') return raw;
        if (raw === 'image/jpg') return 'image/jpeg';
        const source = (asset?.fileName || asset?.uri || '').toLowerCase();
        if (source.endsWith('.jpeg') || source.endsWith('.jpg')) return 'image/jpeg';
        if (source.endsWith('.png')) return 'image/png';
        return null;
      };

      const uploadFotoMascotaSiCorresponde = async (mascotaId) => {
        if (!formData?.avatarAsset?.uri) return;
        const mimeType = resolveMascotaPhotoMimeType(formData.avatarAsset);
        if (!mimeType) {
          setMessage({
            type: "error",
            text: "Formato incorrecto, solo puede ser jpg, jpeg o png",
          });
          setShowMensajeFlotante(true);
          return;
        }
        const extension = mimeType === 'image/png' ? 'png' : 'jpg';
        const name = formData.avatarAsset?.fileName || `mascota-photo-${Date.now()}.${extension}`;
        const uploadData = new FormData();
        uploadData.append("photo", {
          uri: formData.avatarAsset.uri,
          name,
          type: mimeType,
        });
        await uploadMascotaPhoto(mascotaId, uploadData);
      };

      if (editingMascota) {
        const response = await updateMascota(editingMascota.id, mascotaData);
        
        if (response.success) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H2',location:'MisMascotas.js:handleSaveMascota',message:'Update mascota OK',data:{hasId:Boolean(editingMascota?.id),hasResponse:Boolean(response?.success)},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          await uploadFotoMascotaSiCorresponde(editingMascota.id);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H3',location:'MisMascotas.js:handleSaveMascota',message:'Upload foto (edit) completado',data:{hasAvatarAsset:Boolean(formData?.avatarAsset?.uri)},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          await loadMascotas();
          
          setMessage({ 
            type: "success", 
            text: response.message || `¡${formData.nombre} ha sido actualizado correctamente!` 
          });
        }
      } else {
        const response = await createMascota(mascotaData);
        
        if (response.success) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H2',location:'MisMascotas.js:handleSaveMascota',message:'Create mascota OK',data:{hasResponse:Boolean(response?.success),hasMascotaId:Boolean(response?.mascota?.id)},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          const nuevaMascotaId = response?.mascota?.id;
          if (nuevaMascotaId) {
            await uploadFotoMascotaSiCorresponde(nuevaMascotaId);
          }
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H3',location:'MisMascotas.js:handleSaveMascota',message:'Upload foto (create) completado',data:{hasAvatarAsset:Boolean(formData?.avatarAsset?.uri),hasMascotaId:Boolean(response?.mascota?.id)},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          await loadMascotas();
          
          setMessage({ 
            type: "success", 
            text: response.message || `¡${formData.nombre} ha sido agregado correctamente!` 
          });
        }
      }
      
      setShowMensajeFlotante(true);
      
      handleCloseModal();
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H4',location:'MisMascotas.js:handleSaveMascota',message:'Error al guardar mascota',data:{errorMessage:error?.message || 'sin mensaje'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      console.error('Error al guardar mascota:', error);
      setMessage({ 
        type: "error", 
        text: error.message || "Error al guardar mascota" 
      });
      setShowMensajeFlotante(true);
    }
  };
  
  // Generar el texto de condición especial en Perfil Mascota
  const generateCondicionEspecial = (formData) => {
    const conditions = [];
    if (formData.padeceEnfermedad) conditions.push('Enfermedad');
    if (formData.requiereMedicacion) conditions.push('Medicamentos');
    if (formData.cuidadoEspecial) conditions.push('Cuidado especial');
    
    return conditions.length > 0 ? conditions.join('. ') : null;
  };

  const handleHideMensajeFlotante = () => {
    setShowMensajeFlotante(false);
    setMessage({ type: "", text: "" });
  };

  const handleDeleteMascota = (mascota) => {
    setMascotaToDelete(mascota);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteMascota = async () => {
    if (mascotaToDelete) {
      try {
        const response = await deleteMascota(mascotaToDelete.id);
        
        if (response.success) {
          await loadMascotas();
          
          setMessage({ 
            type: "success", 
            text: response.message || `¡${mascotaToDelete.nombre} ha sido eliminada/o correctamente!` 
          });
          setShowMensajeFlotante(true);
        }
      } catch (error) {
        console.error('Error al eliminar mascota:', error);
        setMessage({ 
          type: "error", 
          text: error.message || "Error al eliminar mascota. Por favor, intente nuevamente." 
        });
        setShowMensajeFlotante(true);
      }
    }
    
    setShowDeleteConfirmation(false);
    setMascotaToDelete(null);
  };

  const cancelDeleteMascota = () => {
    setShowDeleteConfirmation(false);
    setMascotaToDelete(null);
  };

  const renderMascota = ({ item }) => (
    <MascotaCard 
      mascota={item} 
      onPress={() => handleMascotaPress(item)}
      onDelete={() => handleDeleteMascota(item)}
    />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container}>
      <MensajeFlotante
        message={message.text}
        type={message.type}
        visible={showMensajeFlotante}
        onHide={handleHideMensajeFlotante}
        duration={4000}
      />
      
      <ScreenHeader 
        title="Mis Mascotas"
        subtitle="Visualiza y gestiona tus mascotas registradas"
        onBackPress={handleBackPress}
        showBackButton={true}
      />
      
      <View style={styles.content}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : mascotas.length > 0 ? (
          <FlatList
            data={mascotas}
            renderItem={renderMascota}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.mascotasList,
              Platform.OS === 'android' && { paddingBottom: navbarHeight },
            ]}
            ItemSeparatorComponent={renderSeparator}
            showsVerticalScrollIndicator={false}
            bounces={true}
          />
        ) : (
          <EmptyMascotasList />
        )}
      </View>
      
      <MascotaFormModal
        visible={modalVisible}
        onClose={handleCloseModal}
        mascotaData={editingMascota}
        onSave={handleSaveMascota}
      />
      
      <FloatingAddBtn 
        onPress={handleAddMascota} 
        accessibilityLabel="Añadir mascota"
      />
      
      <MenuInferior />
      
      <ConfirmacionDialogo
        visible={showDeleteConfirmation}
        title="Eliminar mascota"
        message={`¿Estás seguro de que quieres eliminar a ${mascotaToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteMascota}
        onCancel={cancelDeleteMascota}
        type="danger"
        usePortal={false}
      />
    </SafeAreaView>
  );
};

export default MisMascotas;