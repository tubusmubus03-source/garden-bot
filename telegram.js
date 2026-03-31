const TELEGRAM_BOT_TOKEN = "8670334505:AAHA1Rp_ARdgKHMQxSmeC6-ddUJpiL9Fpvs";
const TELEGRAM_CHAT_ID = "6018966220";

async function sendOrderToTelegram(event, productName = "Невідомий товар або консультація") {
    event.preventDefault(); // Зупиняємо стандартну відправку форми
    const form = event.target;
    
    // Збираємо дані з полів форми
    const inputs = form.querySelectorAll('input, select, textarea');
    let messageText = `🔥 <b>Нове замовлення / заявка!</b>\n\n`;
    messageText += `🛍 <b>Сторінка/Товар:</b> ${productName}\n\n`;
    
    inputs.forEach(input => {
        if (input.name && input.value) {
            // Перекладаємо стандартні імена полів
            let fieldName = input.name;
            if (fieldName === 'name') fieldName = "Ім'я";
            if (fieldName === 'phone') fieldName = 'Телефон';
            if (fieldName === 'question') fieldName = 'Питання';
            if (fieldName === 'rating') fieldName = 'Оцінка';
            if (fieldName === 'review') fieldName = 'Текст відгуку';
            
            messageText += `<b>${fieldName}:</b> ${input.value}\n`;
        }
    });

    // Формуємо URL для API Telegram
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // Блокуємо кнопку відправки
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerText : '';
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Відправка...';
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: messageText,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            // ---- Відправляємо в LP-CRM ----
            let clientName = "Клієнт";
            let clientPhone = "";

            inputs.forEach(input => {
                let lowerName = input.name ? input.name.toLowerCase() : '';
                if (lowerName === 'name' || lowerName === 'ім\'я' || lowerName.includes('name')) clientName = input.value;
                if (lowerName === 'phone' || lowerName === 'телефон' || lowerName.includes('phone')) clientPhone = input.value;
            });

            // Налаштовуємо ID/ціну товару
            let crmProductId = 397; 
            let crmPrice = 1349;



            if (productName.toLowerCase().includes('набір') || productName.toLowerCase().includes('nabor')) {
                crmProductId = 1; 
                crmPrice = 2290;
            }

            // Формуємо масив products у внутрішньому PHP serialize-форматі:
            const sProductId = crmProductId.toString();
            const sPrice = crmPrice.toString();
            const serializedProducts = `a:1:{i:0;a:3:{s:10:"product_id";i:${sProductId};s:5:"price";i:${sPrice};s:5:"count";s:1:"1";}}`;

            const crmFormData = new FormData();
            crmFormData.append('products', serializedProducts);
            crmFormData.append('bayer_name', clientName);
            crmFormData.append('phone', clientPhone);
            crmFormData.append('comment', '📦 Форма з сайту. ' + productName);

            // Витягуємо UTM, якщо вони є в URL
            const urlParams = new URLSearchParams(window.location.search);
            ['utm_source', 'utm_medium', 'utm_term', 'utm_content', 'utm_campaign'].forEach(param => {
                if (urlParams.has(param)) crmFormData.append(param, urlParams.get(param));
            });

            // Відправляємо замовлення у наш PHP-проксі на тому ж сервері
            fetch('crm.php', {
                method: 'POST',
                body: crmFormData
            }).catch(e => console.error("Помилка відправки CRM:", e))
              .finally(() => {
                // Всі запити пішли, переходимо на сторінку "Дякуємо"
                window.location.href = 'thanks.html';
              });
              
        } else {
            // У разі помилки від API
            console.error('Telegram API Response:', await response.text());
            alert('Сталася помилка при відправці замовлення. Упевніться, що ви ввели токен і chat_id. Зателефонуйте нам для підтвердження.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert("Помилка з'єднання. Перевірте підключення до інтернету або вимкніть AdBlock.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    }
}
