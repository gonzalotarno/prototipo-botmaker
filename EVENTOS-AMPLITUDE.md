# Eventos Amplitude — Agentes IA

Lanzamiento: **lunes** con la versión B (listado unificado). Eventos mínimos
para validar lo que entra el día 1.

La idea es medir 2 cosas:

1. **Adopción**: ¿cuántos usuarios entran al agente y a qué tab van?
2. **Conversión**: ¿cuántos llegan a conectar un recurso, cuántos abandonan?

---

## Convenciones

- Nombres en `snake_case`.
- **Super properties** (van en cada evento): `agent_id`, `user_id`, `project_id`.
- Para arrays/objetos complejos preferimos serializar en propiedades planas (Amplitude maneja mejor).

---

## 1. Navegación

### `agent_viewed`
Se dispara al entrar al detalle de un agente.

| Property | Tipo | Descripción |
|---|---|---|
| `entry_point` | string | `landing` \| `sidebar` \| `direct_url` |
| `tab_initial` | string | tab activa al entrar |

### `agent_tab_changed`
Cambio de tab dentro del agente.

| Property | Tipo | Descripción |
|---|---|---|
| `from_tab` | string | tab de origen |
| `to_tab` | string | `perfil` \| `estados` \| `subagentes` \| `bases` \| `mcps` \| `automatizaciones` |

---

## 2. Recursos (MCP / Apps / Códigos)

Los recursos se manejan unificados en V2 dentro del tab MCP. En V1 viven en MCP / Aplicaciones externas / Códigos. Los eventos son los mismos, solo cambia el `kind`.

### `resource_connect_opened`
Apretar "Conectar" en una fila del catálogo.

| Property | Tipo | Descripción |
|---|---|---|
| `resource_kind` | string | `mcp` \| `app` \| `code` |
| `resource_provider` | string? | `Gmail`, `Google Sheets`, `MercadoPago`, `Stripe`, etc. |
| `resource_id` | string | id del workspace resource |
| `accounts_available` | number | cuentas conectadas en Integraciones para ese provider (0/1/2/3+) |

### `resource_connect_completed`
Confirmar el modal de conectar.

| Property | Tipo | Descripción |
|---|---|---|
| `resource_kind` | string | `mcp` \| `app` \| `code` |
| `resource_provider` | string? | |
| `resource_id` | string | |
| `tools_enabled_count` | number | cuántas tools quedaron tildadas |
| `tools_total_count` | number | total disponibles |
| `risky_tools_enabled` | boolean | si dejó alguna marcada como destructiva |
| `account_id` | string? | cuenta seleccionada (apps) |
| `time_in_modal_ms` | number | tiempo desde abrir hasta confirmar |

### `resource_connect_cancelled`
Cerrar el modal sin guardar.

| Property | Tipo | Descripción |
|---|---|---|
| `resource_kind` | string | |
| `resource_provider` | string? | |
| `step` | string | `cuando` \| `cuenta` \| `tools` — última sección que tocó |
| `time_in_modal_ms` | number | |

### `resource_disconnected`
Click en chip "Conectado para el agente" → quitar.

| Property | Tipo | Descripción |
|---|---|---|
| `resource_kind` | string | |
| `resource_provider` | string? | |
| `instance_id` | string | id de la instancia eliminada |

### `resource_new_clicked`
Click en "Agregar nuevo" del header.

| Property | Tipo | Descripción |
|---|---|---|
| (sin props extra, con super props alcanza) | | |

### `resource_new_kind_picked`
Elegir un tipo en el picker (MCP Externo / MCP Interno).

| Property | Tipo | Descripción |
|---|---|---|
| `kind_picked` | string | `mcp_externo` \| `mcp_interno` |

### `resource_new_completed`
Crear el recurso nuevo desde el modal.

| Property | Tipo | Descripción |
|---|---|---|
| `resource_kind` | string | |
| `auth_method` | string? | `none` \| `apikey` \| `oauth` (sólo MCP Externo) |
| `tools_discovered_count` | number? | |
| `tools_enabled_count` | number? | |

### `integraciones_link_clicked`
Click en el link "Conectar nueva cuenta en Integraciones" desde el modal.

| Property | Tipo | Descripción |
|---|---|---|
| `provider` | string | `Gmail`, etc. |
| `from` | string | `connect_modal_empty` \| `connect_modal_top_button` \| `kind_picker_hint` |

---

## 3. Catálogo / búsqueda

### `catalog_searched`
Cuando el usuario tipea en el search del listado. Disparar **debounced 1s**.

| Property | Tipo | Descripción |
|---|---|---|
| `tab` | string | tab donde busca |
| `query_length` | number | sin enviar el contenido |
| `results_count` | number | |

### `catalog_sort_changed`
Cambio de orden en el dropdown.

| Property | Tipo | Descripción |
|---|---|---|
| `tab` | string | |
| `sort_mode` | string | `recomendado` \| `estado` \| `nombre` \| `tipo` |

---

## 4. Bases

Mismo patrón que recursos pero en el tab Bases.

### `base_connect_opened`
| `base_id`, `source` (Drive/Notion/PDF/Texto), `accounts_available` (no aplica para bases) |

### `base_connect_completed`
| `base_id`, `source`, `time_in_modal_ms` |

### `base_disconnected`
| `instance_id`, `source` |

### `base_upload_started`
Click en "Agregar nuevo" en Bases (abre el drawer).

### `base_uploaded`
Subir una base nueva al Proyecto.

| Property | Tipo | Descripción |
|---|---|---|
| `source_type` | string | `link` \| `archivo` \| `texto` |
| `doc_count` | number? | si aplica |

---

## 5. Lógicas

### `logic_create_opened`
Click en "Agregar nueva".

### `logic_created`
Confirmar el form.

| Property | Tipo | Descripción |
|---|---|---|
| `logic_id` | string | |
| `trigger_length` | number | longitud del trigger (proxy de cuán específico es) |

### `logic_canvas_opened`
Click en una fila → entra al editor visual.

| Property | Tipo | Descripción |
|---|---|---|
| `logic_id` | string | |
| `node_count` | number | |

### `logic_edited`
Confirmar modal de editar.

| Property | Tipo | Descripción |
|---|---|---|
| `logic_id` | string | |
| `field_changed` | string | `name` \| `trigger` \| `both` |

### `logic_deleted`
| `logic_id` |

---

## 6. Automatizaciones

### `automation_create_opened`
Abre el picker de templates.

### `automation_template_selected`
Click en un template predefinido.

| Property | Tipo | Descripción |
|---|---|---|
| `template_id` | string | `cron-5m`, `cron-hour`, `cron-9am`, `cron-mon`, `flow-status`, `flow-msg`, `webhook` |
| `template_type` | string | `CRON` \| `Workflow` \| `Webhook` |

### `automation_custom_opened`
Click en "Configuración custom" del picker.

### `automation_created`
Disparador agregado al agente (vía template o custom).

| Property | Tipo | Descripción |
|---|---|---|
| `automation_id` | string | |
| `source` | string | `template` \| `custom` |
| `template_id` | string? | si vino de template |

### `automation_deleted`
| `automation_id` |

---

## 7. Perfil

### `llm_changed`
Cambio de modelo generativo en el carousel.

| Property | Tipo | Descripción |
|---|---|---|
| `from_model` | string | `claude-sonnet-4.7`, `claude-haiku-4.5`, `gpt-5`, `gemini-2.5-pro` |
| `to_model` | string | |

### `agent_saved`
Click en "Guardar".

### `agent_published`
Click en "Publicar".

---

## 8. Errores / fricción (opcional pero útil)

### `connect_validation_blocked`
El usuario apretó "Conectar al agente" pero el botón está disabled — algún campo falta. Disparar al `mouseenter` del disabled OR al detectar click.

| Property | Tipo | Descripción |
|---|---|---|
| `missing_field` | string | `cuando` \| `cuenta` \| `tools` |

### `account_empty_state_seen`
El modal abrió la sección de cuentas pero el usuario no tiene ninguna conectada de ese provider.

| Property | Tipo | Descripción |
|---|---|---|
| `provider` | string | |

---

## Lo que NO necesitamos (yet)

- Heatmaps de scroll dentro de los modales — empezamos con conteos.
- Eventos de hover — ruido.
- Tiempos en cada tab — `agent_tab_changed` ya da time-in-tab por diferencia.

---

## Prioridades

**P0** (bloqueante para el lunes):
- `agent_viewed`
- `agent_tab_changed`
- `resource_connect_opened` / `_completed` / `_cancelled` / `_disconnected`
- `resource_new_clicked` / `_kind_picked` / `_completed`
- `base_connect_completed`
- `automation_created`
- `logic_created`
- `llm_changed`
- `agent_published`

**P1** (la semana siguiente):
- Todo el grupo de Catálogo/búsqueda (search, sort)
- Errores (`connect_validation_blocked`, `account_empty_state_seen`)
- `integraciones_link_clicked`

**P2** (cuando haya tiempo):
- `agent_saved`, `logic_edited`, `logic_canvas_opened`
- Time-in-modal en todos los conectar
