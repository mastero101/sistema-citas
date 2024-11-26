const { format } = require('date-fns');
const { es } = require('date-fns/locale');
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');
const Appointment = require('../models/Appointment');

require('dotenv').config();
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("Error: El token del bot de Telegram no está proporcionado.");
    process.exit(1); // Salir si no hay token
}

const bot = new TelegramBot(token, { polling: true });

// Manejador para iniciar el bot con teclado de sugerencias de comandos
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
  
    const welcomeMessage = `
    ¡Hola! Soy tu bot de citas médicas. Aquí tienes los comandos que puedes utilizar:
    
    /crearcita - Crear una nueva cita médica
    /consultarcita - Consultar una cita existente por nombre, fecha o ambos
    /cancelarcita - Cancelar una cita existente
    /help - Ver esta lista de comandos de nuevo
    
    ¿Cómo puedo ayudarte hoy?
    `;
  
    // Enviar mensaje de bienvenida junto con las sugerencias de comandos
    bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: {
        keyboard: [
          [{ text: '/crearcita' }],
          [{ text: '/consultarcita' }],
          [{ text: '/cancelarcita' }],
          [{ text: '/help' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
});
  
// Manejador para mostrar la ayuda en cualquier momento con teclado de sugerencias
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
  
    const helpMessage = `
    Aquí tienes los comandos que puedes utilizar:
    
    /crearcita - Crear una nueva cita médica
    /consultarcita - Consultar una cita existente por nombre, fecha o ambos
    /cancelarcita - Cancelar una cita existente
    
    Estoy aquí para ayudarte. ¿Qué necesitas hacer hoy?
    `;
  
    // Enviar mensaje de ayuda junto con las sugerencias de comandos
    bot.sendMessage(chatId, helpMessage, {
      reply_markup: {
        keyboard: [
          [{ text: '/crearcita' }],
          [{ text: '/consultarcita' }],
          [{ text: '/cancelarcita' }],
          [{ text: '/help' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
});

  function generateDateKeyboard() {
    const keyboard = [];
    const today = moment();
    
    for (let i = 0; i < 7; i++) {
      const date = today.clone().add(i, 'days');
      keyboard.push([{
        text: date.format('DD/MM/YYYY'),
        callback_data: `date_${date.format('YYYY-MM-DD')}`
      }]);
    }
    
    return keyboard;
  }
  
  function generateTimeKeyboard() {
    const keyboard = [];
    const startTime = moment().set({hour: 9, minute: 0});
    const endTime = moment().set({hour: 21, minute: 0});
    
    while (startTime.isSameOrBefore(endTime)) {
      keyboard.push([{
        text: startTime.format('HH:mm'),
        callback_data: `time_${startTime.format('HH:mm')}`
      }]);
      startTime.add(30, 'minutes');
    }
    
    return keyboard;
  }

// Función para validar la hora
function isValidTime(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(hours, minutes, 0, 0);
  
    // Definir el rango de tiempo permitido
    const start = new Date();
    start.setHours(9, 0, 0, 0);
  
    const end = new Date();
    end.setHours(21, 0, 0, 0);
  
    return appointmentTime >= start && appointmentTime <= end;
}

let currentAppointment = {};

bot.onText(/\/crearcita/, async (msg) => {
    const chatId = msg.chat.id;
    currentAppointment = {};

    // Pregunta el nombre del paciente
    bot.sendMessage(chatId, "Por favor, proporciona el nombre del paciente:");

    bot.once('message', (nameMsg) => {
        currentAppointment.name = nameMsg.text;
        console.log("Nombre registrado:", currentAppointment.name);

        // Pregunta la fecha de la cita
        bot.sendMessage(chatId, "Selecciona la fecha de la cita o introduce en formato YYYY-MM-DD", {
            reply_markup: {
                inline_keyboard: generateDateKeyboard()
            }
        });
    });
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const [action, value] = query.data.split('_');

    if (action === 'date') {
        currentAppointment.date = value;
        console.log("Fecha seleccionada:", currentAppointment.date);
        bot.answerCallbackQuery(query.id);
        bot.sendMessage(chatId, "Selecciona la hora de la cita:", {
            reply_markup: {
                inline_keyboard: generateTimeKeyboard()
            }
        });
    } else if (action === 'time') {
        currentAppointment.time = value;
        console.log("Hora seleccionada:", currentAppointment.time);
        bot.answerCallbackQuery(query.id);
        bot.sendMessage(chatId, "Por favor, proporciona una descripción para la cita:");
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    
    if (!currentAppointment.date && msg.text.match(/^\d{4}-\d{2}-\d{2}$/)) {
        currentAppointment.date = msg.text;
        console.log("Fecha introducida manualmente:", currentAppointment.date);
        askForTime(chatId);
    } else if (!currentAppointment.time && msg.text.match(/^\d{2}:\d{2}$/)) {
        handleTimeInput(chatId, msg.text);
    } else if (currentAppointment.time && !currentAppointment.description) {
        handleDescriptionInput(chatId, msg.text);
    }
});

function askForTime(chatId) {
    bot.sendMessage(chatId, "Por favor, proporciona la hora de la cita en formato HH:MM (solo entre 09:00 y 21:00):");
}

function handleTimeInput(chatId, time) {
    if (!isValidTime(time)) {
        bot.sendMessage(chatId, "La hora proporcionada no es válida. Debe estar entre 09:00 y 21:00.");
        return;
    }
    
    currentAppointment.time = time;
    console.log("Hora registrada:", currentAppointment.time);
    
    bot.sendMessage(chatId, "Por favor, proporciona una descripción para la cita:");
}

function handleDescriptionInput(chatId, description) {
    currentAppointment.description = description;
    console.log("Descripción registrada:", currentAppointment.description);

    createAppointment(chatId);
}


function createAppointment(chatId) {
    const [year, month, day] = currentAppointment.date.split('-').map(Number);
    const [hours, minutes] = currentAppointment.time.split(':').map(Number);

    // Crear la fecha en la zona horaria local
    const appointmentDate = new Date(year, month - 1, day, hours, minutes);

    const appointment = new Appointment({
        name: currentAppointment.name,
        date: appointmentDate,
        description: currentAppointment.description,
        time: currentAppointment.time
    });

    appointment.save()
        .then(() => {
            console.log("Cita guardada:", appointment);
            bot.sendMessage(chatId, "¡Cita creada exitosamente!");
            currentAppointment = {}; // Limpiar el objeto de cita actual
        })
        .catch((err) => {
            console.error("Error al guardar la cita:", err);
            bot.sendMessage(chatId, "Hubo un error al crear la cita. Inténtalo de nuevo.");
        });
}

// Manejador para consultar citas por nombre, fecha, o ambos
bot.onText(/\/consultarcita/, (msg) => {
    const chatId = msg.chat.id;
  
    //Pregunta si desea buscar por nombre, fecha, o ambos en el menu de opciones o tipeado
    bot.sendMessage(chatId, "¿Cómo deseas buscar la cita? Escribe 'Nombre', 'Fecha', o 'Ambos':", {
        reply_markup: {
          keyboard: [
            [{ text: 'Nombre' }],
            [{ text: 'Fecha' }],
            [{ text: 'Ambos' }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
    });
  
    bot.once('message', (filterMsg) => {
      const filter = filterMsg.text.toLowerCase();
  
      if (filter === 'nombre' || filter === 'ambos') {
        bot.sendMessage(chatId, "Por favor, proporciona el nombre del paciente:");
  
        bot.once('message', (nameMsg) => {
          const name = nameMsg.text;
  
          if (filter === 'fecha' || filter === 'ambos') {
            bot.sendMessage(chatId, "Por favor, proporciona la fecha de la cita en formato YYYY-MM-DD:");
  
            bot.once('message', async (dateMsg) => {
              const date = new Date(dateMsg.text);
              await searchAppointments(chatId, { name, date });
            });
          } else {
            searchAppointments(chatId, { name });
          }
        });
      } else if (filter === 'fecha') {
        bot.sendMessage(chatId, "Por favor, proporciona la fecha de la cita en formato YYYY-MM-DD:");
  
        bot.once('message', async (dateMsg) => {
          const date = new Date(dateMsg.text);
          await searchAppointments(chatId, { date });
        });
      } else {
        bot.sendMessage(chatId, "Opción no válida. Por favor, usa 'nombre', 'fecha', o 'ambos'.");
      }
    });
});
  
    // Función para buscar citas y enviar los resultados al usuario
    async function searchAppointments(chatId, filters) {
        try {
            // Construir la consulta basada en los filtros proporcionados
            const query = {};
            if (filters.name) query.name = filters.name;

            // Si se proporciona una fecha, buscar solo las citas que coincidan con esa fecha sin considerar la hora
            if (filters.date) {
                const startOfDay = new Date(filters.date.setHours(0, 0, 0, 0));
                const endOfDay = new Date(filters.date.setHours(23, 59, 59, 999));
                query.date = { $gte: startOfDay, $lte: endOfDay };
            }

            const appointments = await Appointment.find(query);

            if (appointments.length > 0) {
                let response = 'Citas encontradas:\n';

                appointments.forEach(appointment => {
                    const appointmentDate = format(appointment.date, 'eeee dd MMMM yyyy', { locale: es });
                    const appointmentTime = appointment.time;
                    const capitalizedDate = capitalizeFirstLetter(appointmentDate);
                    response += `\n- Nombre: ${appointment.name}\n  Fecha: ${capitalizedDate}\n  Hora: ${appointmentTime}\n  Descripción: ${appointment.description}`;
                });

                bot.sendMessage(chatId, response);
            } else {
                bot.sendMessage(chatId, "No se encontraron citas con los criterios proporcionados.");
            }
        } catch (err) {
            bot.sendMessage(chatId, "Hubo un error al buscar las citas. Inténtalo de nuevo.");
        }
    }


    // Función para capitalizar la primera letra de cada palabra
    function capitalizeFirstLetter(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

// Manejador para cancelar citas
bot.onText(/\/cancelarcita/, async (msg) => {
    const chatId = msg.chat.id;

    // Pregunta el nombre del paciente
    bot.sendMessage(chatId, "Por favor, proporciona el nombre del paciente cuyas citas deseas cancelar:");

    bot.once('message', async (nameMsg) => {
        const name = nameMsg.text;

        // Pregunta la fecha de la cita a cancelar
        bot.sendMessage(chatId, "Por favor, proporciona la fecha de la cita en formato YYYY-MM-DD:");

        bot.once('message', async (dateMsg) => {
            const date = new Date(dateMsg.text);

            // Convertir la fecha para buscar en la base de datos
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            try {
                // Buscar las citas en la base de datos
                const appointments = await Appointment.find({
                    name,
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                });

                if (appointments.length > 0) {
                    // Mostrar las citas encontradas en una lista
                    let message = "Citas encontradas:\n";
                    const keyboard = [];
                    appointments.forEach((appointment, index) => {
                        const appointmentDate = format(appointment.date, 'eeee dd MMMM yyyy HH:mm', { locale: es });
                        message += `${index + 1}. Nombre: ${appointment.name}\nFecha: ${appointmentDate}\nDescripción: ${appointment.description}\n\n`;
                        keyboard.push([{ text: `Cancelar cita ${index + 1}`, callback_data: `confirm_${appointment._id}` }]);
                    });

                    bot.sendMessage(chatId, message, {
                        reply_markup: {
                            inline_keyboard: keyboard
                        }
                    });
                } else {
                    bot.sendMessage(chatId, "No se encontró una cita con ese nombre y fecha.");
                }
            } catch (err) {
                bot.sendMessage(chatId, "Hubo un error al buscar la cita. Inténtalo de nuevo.");
            }
        });
    });
});

// Manejador para el callback de los botones de confirmación en cancelarcita
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const callbackData = query.data.split('_');
    const action = callbackData[0]; // Acción (confirm o cancel)
    const appointmentId = callbackData[1]; // ID de la cita

    if (action === 'confirm') {
        // Pedir confirmación para cancelar la cita
        const appointment = await Appointment.findById(appointmentId);

        if (appointment) {
            const appointmentDate = format(appointment.date, 'eeee dd MMMM yyyy HH:mm', { locale: es });
            const confirmationMessage = `¿Estás seguro que deseas cancelar la cita con nombre ${appointment.name} y fecha ${appointmentDate}? Responde con 'Sí' para confirmar o 'No' para cancelar.`;

            bot.sendMessage(chatId, confirmationMessage, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Sí', callback_data: `delete_${appointmentId}` }],
                        [{ text: 'No', callback_data: 'cancel' }]
                    ]
                }
            });
        } else {
            bot.sendMessage(chatId, "No se encontró la cita para cancelar.");
        }
    } else if (action === 'delete') {
        // Eliminar la cita
        try {
            const appointment = await Appointment.findByIdAndDelete(appointmentId);

            if (appointment) {
                bot.sendMessage(chatId, `La cita con nombre ${appointment.name} y fecha ${format(appointment.date, 'eeee dd MMMM yyyy HH:mm', { locale: es })} ha sido cancelada exitosamente.`);
            } else {
                bot.sendMessage(chatId, "No se encontró la cita para cancelar.");
            }
        } catch (err) {
            bot.sendMessage(chatId, "Hubo un error al cancelar la cita. Inténtalo de nuevo.");
        }
    } else if (query.data === 'cancel') {
        // Cancelar la operación
        bot.sendMessage(chatId, "Cancelación de la cita abortada.");
    }
});

// Metodo relacionado al datepicker para la creacion de cita
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const [action, value] = query.data.split('_');
  
    if (action === 'date') {
      currentAppointment.date = value;
      bot.answerCallbackQuery(query.id);
      bot.sendMessage(chatId, "Selecciona la hora de la cita:", {
        reply_markup: {
          inline_keyboard: generateTimeKeyboard()
        }
      });
    } else if (action === 'time') {
      currentAppointment.time = value;
      bot.answerCallbackQuery(query.id);
      
    }
});