import SplashScreen from "../screens/splash/splash";
import BienvenidaScreen from "../screens/bienvenida/bienvenida";
import RegistroScreen from "../screens/registro/registro";
import InicioScreen from "../screens/inicio/inicio";
import HomeScreen from "../screens/home/home";
import CuidadoresScreen from "../screens/cuidadores/Cuidadores";
import PaseadoresScreen from "../screens/paseadores/Paseadores";
import SaludScreen from "../screens/salud/Salud";
import PerfilScreen from "../screens/perfil/perfil";
import EditarPerfil from "../screens/perfil/editarPerfil/editarPerfil";
import MisMascotasScreen from "../screens/misMascotas/MisMascotas";
import PanelAdminScreen from "../screens/panelAdmin";
import ValidarUsuarioScreen from "../screens/panelAdmin/ValidarUsuario/ValidarUsuario";
import MisConexionesScreen from "../screens/misConexiones/MisConexiones";
import ResenasScreen from "../screens/resenas/Resenas";
import ChatScreen from "../screens/chat/Chat";
import Conversacion from "../screens/chat/Conversacion";
import MapaScreen from "../screens/mapa/Mapa";
import EstadoCuentaScreen from "../screens/estadoCuenta/EstadoCuenta";

export const publicScreens = [
  { name: "Splash", component: SplashScreen },
  { name: "Bienvenida", component: BienvenidaScreen },
  { name: "Registro", component: RegistroScreen },
  { name: "Inicio", component: InicioScreen },
  { name: "Home", component: HomeScreen },
  { name: "Perfil", component: PerfilScreen },
  { name: "EditarPerfil", component: EditarPerfil },
  { name: "MisMascotas", component: MisMascotasScreen },
  { name: "EstadoCuenta", component: EstadoCuentaScreen },
];

export const guardedScreens = [
  { name: "Cuidadores", component: CuidadoresScreen },
  { name: "Paseadores", component: PaseadoresScreen },
  { name: "Salud", component: SaludScreen },
  { name: "PanelAdmin", component: PanelAdminScreen },
  { name: "ValidarUsuario", component: ValidarUsuarioScreen },
  { name: "MisConexiones", component: MisConexionesScreen },
  { name: "Resenas", component: ResenasScreen },
  { name: "Chat", component: ChatScreen },
  { name: "Conversacion", component: Conversacion },
  { name: "Mapa", component: MapaScreen },
];

