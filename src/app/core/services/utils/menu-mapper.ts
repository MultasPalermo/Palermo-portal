  import { MenuItem } from 'primeng/api';
  import { BackendMenuItem, BackendSubMenuItem } from '../../../shared/components/sidebar.config';

  export function mapBackendMenuToPrimeNG(menu: BackendMenuItem[]): MenuItem[] {
    console.log('🔍 Menu del backend:', menu);
    
    // Recopilar todos los formularios de todas las secciones
    const allForms: BackendSubMenuItem[] = [];
    menu.forEach(section => {
      allForms.push(...section.forms);
    });
    
    console.log('📋 Todos los formularios:', allForms);
    
    // Crear secciones organizadas lógicamente
    const organizedSections = createOrganizedSections(allForms);
    
    return organizedSections;
  }

  // Función para crear secciones organizadas
  function createOrganizedSections(allForms: BackendSubMenuItem[]): MenuItem[] {
    const sections: MenuItem[] = [];
    const usedFormIds: number[] = []; // Para evitar duplicados
    
    // 1. GESTIÓN DE CONTENIDO - Creación de multas, tipos e identificación ciudadana
    const contentForms = allForms.filter(form => {
      if (usedFormIds.includes(form.id)) return false;
      
      const name = form.name.toLowerCase();
      const isContentForm = (name.includes('formulario') && 
                            (name.includes('creacion') || name.includes('tipo')) &&
                            name.includes('multa') && !name.includes('notificacion')) ||
                          (name.includes('multa') && !name.includes('municipio') && !name.includes('formulario') && !name.includes('notificacion')) ||
                          name.includes('inicio') ||
                          name.includes('identificacion') ||
                          name.includes('identificación');
      
      if (isContentForm) {
        usedFormIds.push(form.id);
        return true;
      }
      return false;
    });
    
    if (contentForms.length > 0) {
      sections.push({
        label: 'Gestión de Contenido',
        icon: 'pi pi-fw pi-folder-open',
        items: contentForms.map(form => mapFormToMenuItem(form))
      });
    }
    
    // 2. NOTIFICACIONES - Gestión de notificaciones y comunicaciones
    const notificationForms = allForms.filter(form => {
      if (usedFormIds.includes(form.id)) return false;
      
      const name = form.name.toLowerCase();
      const isNotificationForm = name.includes('notificacion') || 
                                name.includes('notification') ||
                                (name.includes('formulario') && name.includes('notificacion'));
      
      if (isNotificationForm) {
        usedFormIds.push(form.id);
        return true;
      }
      return false;
    });
    
    if (notificationForms.length > 0) {
      sections.push({
        label: 'Notificaciones',
        icon: 'pi pi-fw pi-bell',
        items: notificationForms.map(form => mapFormToMenuItem(form))
      });
    }
    
    // 3. ADMINISTRACIÓN AVANZADA - Formularios, módulos, usuarios, roles, permisos
    const adminForms = allForms.filter(form => {
      if (usedFormIds.includes(form.id)) return false;
      
      const name = form.name.toLowerCase();
      const isAdminForm = name.includes('form modules') ||
                        name.includes('formularios') ||
                        (name.includes('formulario') && !name.includes('multa')) ||
                        name.includes('módulo') ||
                        name.includes('modulo') ||
                        name.includes('persona') ||
                        name.includes('permiso') ||
                        name.includes('rol') ||
                        (name.includes('usuario') && !name.includes('tipo'));
      
      if (isAdminForm) {
        usedFormIds.push(form.id);
        return true;
      }
      return false;
    });
    
    if (adminForms.length > 0) {
      sections.push({
        label: 'Administración Avanzada',
        icon: 'pi pi-fw pi-cog',
        items: adminForms.map(form => mapFormToMenuItem(form))
      });
    }
    
    // 4. PARÁMETROS DEL SISTEMA - Configuraciones, municipios y parámetros
    const parameterForms = allForms.filter(form => {
      if (usedFormIds.includes(form.id)) return false;

      const name = form.name.toLowerCase();
      const isParameterForm = name.includes('departamento') ||
                            name.includes('department') ||
                            name.includes('municipio') ||
                            name.includes('municipality') ||
                            name.includes('documento') ||
                            name.includes('document') ||
                            name.includes('tipo de documento') ||
                            name.includes('frecuencia') ||
                            name.includes('frequency') ||
                            name.includes('parametro') ||
                            name.includes('parameter') ||
                            name.includes('smdlv') ||
                            name.includes('valor');

      if (isParameterForm) {
        usedFormIds.push(form.id);
        return true;
      }
      return false;
    });
    
    if (parameterForms.length > 0) {
      sections.push({
        label: 'Parámetros del Sistema',
        icon: 'pi pi-fw pi-wrench',
        items: parameterForms.map(form => mapFormToMenuItem(form))
      });
    }
    
    // 5. MI PERFIL - Configuraciones personales
    const profileForms = allForms.filter(form => {
      if (usedFormIds.includes(form.id)) return false;
      
      const name = form.name.toLowerCase();
      const isProfileForm = name.includes('perfil') || name.includes('profile');
      
      if (isProfileForm) {
        usedFormIds.push(form.id);
        return true;
      }
      return false;
    });
    
    if (profileForms.length > 0) {
      sections.push({
        label: 'Mi Perfil',
        icon: 'pi pi-fw pi-user',
        items: profileForms.map(form => mapFormToMenuItem(form))
      });
    }
    
    // Verificar elementos no categorizados (solo para debug, no se agregan al menú)
    const uncategorizedForms = allForms.filter(form => !usedFormIds.includes(form.id));
    
    if (uncategorizedForms.length > 0) {
      console.log('⚠️ Elementos no categorizados (no se mostrarán):', uncategorizedForms);
    }
    
    console.log('✅ Secciones organizadas:', sections);
    console.log('🔢 Total de formularios procesados:', usedFormIds.length, 'de', allForms.length);
    return sections;
  }

  // Función auxiliar para mapear formulario a elemento de menú
  function mapFormToMenuItem(form: BackendSubMenuItem): any {
    let route = form.route;
    let label = form.name;
    
    // Si el nombre contiene "perfil", forzar la ruta a /perfil
    if (form.name.toLowerCase().includes('perfil')) {
      route = 'perfil';
      console.log(`👤 Ruta de perfil detectada: ${form.name} -> /perfil`);
    } else if (form.name.toLowerCase().includes('inicio')) {
      // Cambiar el nombre de "inicio" a "Identificación ciudadana"
      label = 'Identificación ciudadana';
      console.log(`🏠 Ruta de inicio detectada: ${form.name} -> /${route} (renombrado a: ${label})`);
    } else {
      console.log(`📝 Mapeando: ${form.name} -> /${route}`);
    }
    
    return {
      label: label,
      icon: getIconForMenuItem(form.name),
      routerLink: ['/' + route],
      disabled: !form.state,
      originalForm: form // Guardamos referencia para evitar duplicados
    };
  }

  // Función para determinar el icono de la sección basado en el nombre
  function getIconForSection(sectionName: string): string {
    const name = sectionName.toLowerCase();
    
    if (name.includes('contenido')) return 'pi pi-fw pi-folder-open';
    if (name.includes('gestión') || name.includes('gestion')) return 'pi pi-fw pi-cog';
    if (name.includes('perfil')) return 'pi pi-fw pi-user-edit';
    if (name.includes('admin')) return 'pi pi-fw pi-shield';
    if (name.includes('reporte')) return 'pi pi-fw pi-chart-bar';
    
    return 'pi pi-fw pi-th-large'; // Icono por defecto
  }

  // Función para determinar el icono del elemento del menú basado en el nombre
  function getIconForMenuItem(itemName: string): string {
    const name = itemName.toLowerCase();
    
    // Perfil y usuario
    if (name.includes('perfil')) return 'pi pi-fw pi-user';
    if (name.includes('usuario') && name.includes('rol')) return 'pi pi-fw pi-users';
    if (name.includes('usuario')) return 'pi pi-fw pi-user-plus';
    
    // Formularios específicos
    if (name.includes('formulario')) {
      if (name.includes('creacion')) return 'pi pi-fw pi-plus-circle';
      if (name.includes('tipo')) return 'pi pi-fw pi-tags';
      if (name.includes('notificacion')) return 'pi pi-fw pi-bell';
      return 'pi pi-fw pi-file-edit';
    }
    
    // Módulos y administración
    if (name.includes('form modules') || name.includes('formularios')) return 'pi pi-fw pi-clone';
    if (name.includes('módulo') || name.includes('modulo')) return 'pi pi-fw pi-box';
    if (name.includes('persona')) return 'pi pi-fw pi-users';
    if (name.includes('permiso')) return 'pi pi-fw pi-key';
    if (name.includes('rol')) return 'pi pi-fw pi-id-card';
    
    // Parámetros y configuración
    if (name.includes('departamento')) return 'pi pi-fw pi-map';
    if (name.includes('municipio')) return 'pi pi-fw pi-building';
    if (name.includes('documento')) return 'pi pi-fw pi-file-o';
    if (name.includes('tipo de documento')) return 'pi pi-fw pi-file';
    if (name.includes('frecuencia')) return 'pi pi-fw pi-clock';
    if (name.includes('smdlv') || name.includes('valor')) return 'pi pi-fw pi-dollar';
    
    // Multas y notificaciones
    if (name.includes('multa')) return 'pi pi-fw pi-exclamation-triangle';
    if (name.includes('notificacion')) return 'pi pi-fw pi-bell';
    
    // Identificación e inicio
    if (name.includes('inicio') || name.includes('identificacion') || name.includes('identificación')) return 'pi pi-fw pi-id-card';
    
    return 'pi pi-fw pi-circle'; // Icono por defecto
  }

