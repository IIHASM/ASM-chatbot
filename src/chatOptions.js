/**
 * Configuración de las opciones automatizadas del chatbot.
 * Aquí puedes definir las preguntas (label) y las respuestas (answer) predefinidas.
 */
export const defaultOptions = {
    es: [
        {
            label: 'Quiénes somos',
            answer: '<section class="about-section"><h2>Somos ASM Tech Growth, tu partner en innovación tecnológica sostenible.</h2><p>Con más de 20 años de experiencia, creamos soluciones tecnológicas diferentes, innovadoras y con menor impacto ambiental.</p><p>Te acompañamos en tu estrategia de crecimiento aportando:</p><ul><li><strong>Personas:</strong> talento, cercanía y colaboración.</li><li><strong>Innovación:</strong> nos encantan los retos y pensar diferente.</li><li><strong>Creatividad:</strong> miradas diversas para soluciones únicas.</li><li><strong>Compromiso:</strong> relaciones de confianza y crecimiento sostenible.</li></ul><p>¿Quieres impulsar tu tecnología de forma sostenible e innovadora? Estoy aquí para ayudarte.</p></section>'
        },
        {
            label: 'Contacto',
            answer: '<section class="contact-section"><h2>Hablemos de qué soluciones digitales únicas podemos construir juntos.</h2><div class="location"><h3>Headquarters</h3><p>Tel: <a href="tel:+34935951115">+34 93 595 11 15</a></p><p>Email: <a href="mailto:info@asmtch.com">info@asmtch.com</a></p><p><a href="https://www.google.com/maps/search/?api=1&query=DFactory+Calle+27+10-16+Sector+BZ+Zona+Franca+08040+Barcelona" target="_blank">DFactory<br>Calle 27, 10-16 Sector BZ Zona Franca · 08040 Barcelona (España)</a></p></div><div class="location"><h3>León Digital Hub</h3><p>Tel: <a href="tel:+34987347778">+34 98 734 77 78</a></p><p>Email: <a href="mailto:info@asmtch.com">info@asmtch.com</a></p><p><a href="https://www.google.com/maps/search/?api=1&query=Calle+Santos+Ovejero+1+B-13+24008+León" target="_blank">Calle Santos Ovejero, 1 B-13<br>24008 León (España)</a></p></div></section>'
        },
        {
            label: 'Comercial',
            answer: '<p>Déjanos tus datos a continuación y nos pondremos en contacto contigo para explorar cómo crear soluciones digitales únicas: </p>',
            hasForm: true,
            formType: 'commercial'
        },
        {
            label: 'Soporte',
            answer: 'Para poder ayudarte con tu incidencia, por favor proporciónanos los siguientes datos:',
            hasForm: true,
            formType: 'support'
        }
    ],
    ca: [
        {
            label: 'Qui som',
            answer: '<section class="about-section"><h2>Som ASM Tech Growth, el teu partner en innovació tecnològica sostenible.</h2><p>Amb més de 20 anys d\'experiència, creem solucions tecnològiques diferents, innovadores i amb menor impacte ambiental.</p><p>T\'acompanyem en la teva estratègia de creixement aportant:</p><ul><li><strong>Persones:</strong> talent, proximitat i col·laboració.</li><li><strong>Innovació:</strong> ens encanten els reptes i pensar diferent.</li><li><strong>Creativitat:</strong> mirades diverses per a solucions úniques.</li><li><strong>Compromís:</strong> relacions de confiança i creixement sostenible.</li></ul><p>Vols impulsar la teva tecnologia de forma sostenible i innovadora? Estic aquí per ajudar-te.</p></section>'
        },
        {
            label: 'Contacte',
            answer: '<section class="contact-section"><h2>Parlem de quines solucions digitals úniques podem construir junts.</h2><div class="location"><h3>Headquarters</h3><p>Tel: <a href="tel:+34935951115">+34 93 595 11 15</a></p><p>Email: <a href="mailto:info@asmtch.com">info@asmtch.com</a></p><p><a href="https://www.google.com/maps/search/?api=1&query=DFactory+Calle+27+10-16+Sector+BZ+Zona+Franca+08040+Barcelona" target="_blank">DFactory<br>Carrer 27, 10-16 Sector BZ Zona Franca · 08040 Barcelona (Espanya)</a></p></div><div class="location"><h3>León Digital Hub</h3><p>Tel: <a href="tel:+34987347778">+34 98 734 77 78</a></p><p>Email: <a href="mailto:info@asmtch.com">info@asmtch.com</a></p><p><a href="https://www.google.com/maps/search/?api=1&query=Calle+Santos+Ovejero+1+B-13+24008+León" target="_blank">Calle Santos Ovejero, 1 B-13<br>24008 León (Espanya)</a></p></div></section>'
        },
        {
            label: 'Comercial',
            answer: '<p>Deixa\'ns les teves dades a continuació i ens posarem en contacte amb tu per explorar com crear solucions digitals úniques: </p>',
            hasForm: true,
            formType: 'commercial'
        },
        {
            label: 'Suport',
            answer: 'Per poder ajudar-te amb la teva incidència, si us plau proporciona\'ns les següents dades:',
            hasForm: true,
            formType: 'support'
        }
    ],
    en: [
        {
            label: 'Who we are',
            answer: '<section class="about-section"><h2>We are ASM Tech Growth, your partner in sustainable technological innovation.</h2><p>With over 20 years of experience, we create different, innovative technological solutions with lower environmental impact.</p><p>We accompany you in your growth strategy by providing:</p><ul><li><strong>People:</strong> talent, proximity, and collaboration.</li><li><strong>Innovation:</strong> we love challenges and thinking differently.</li><li><strong>Creativity:</strong> diverse perspectives for unique solutions.</li><li><strong>Commitment:</strong> relationships of trust and sustainable growth.</li></ul><p>Do you want to boost your technology in a sustainable and innovative way? I am here to help you.</p></section>'
        },
        {
            label: 'Contact',
            answer: '<section class="contact-section"><h2>Let\'s talk about what unique digital solutions we can build together.</h2><div class="location"><h3>Headquarters</h3><p>Tel: <a href="tel:+34935951115">+34 93 595 11 15</a></p><p>Email: <a href="mailto:info@asmtch.com">info@asmtch.com</a></p><p><a href="https://www.google.com/maps/search/?api=1&query=DFactory+Calle+27+10-16+Sector+BZ+Zona+Franca+08040+Barcelona" target="_blank">DFactory<br>Calle 27, 10-16 Sector BZ Zona Franca · 08040 Barcelona (Spain)</a></p></div><div class="location"><h3>León Digital Hub</h3><p>Tel: <a href="tel:+34987347778">+34 98 734 77 78</a></p><p>Email: <a href="mailto:info@asmtch.com">info@asmtch.com</a></p><p><a href="https://www.google.com/maps/search/?api=1&query=Calle+Santos+Ovejero+1+B-13+24008+León" target="_blank">Calle Santos Ovejero, 1 B-13<br>24008 León (Spain)</a></p></div></section>'
        },
        {
            label: 'Commercial',
            answer: '<p>Leave your details below and we will contact you to explore how to create unique digital solutions: </p>',
            hasForm: true,
            formType: 'commercial'
        },
        {
            label: 'Support',
            answer: 'To help you with your incident, please provide us with the following data:',
            hasForm: true,
            formType: 'support'
        }
    ]
};
