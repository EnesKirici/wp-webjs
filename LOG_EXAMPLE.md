# Yeni Log Formatı Örnekleri

## Normal Mesaj Akışı

```
2025-10-03 18:00:01 [info]: 📨 Message received from 905521596125@c.us
2025-10-03 18:00:01 [info]: Processing message from 905521596125@c.us
  message: "Merhaba bot!"
  messageLength: 12
  contextLength: 1

2025-10-03 18:00:03 [info]: Response sent to 905521596125@c.us
  response: "Merhaba! Size nasıl yardımcı olabilirim?"
  responseLength: 38
```

## Uzun Konuşma (Context)

```
2025-10-03 18:01:15 [info]: Processing message from 905521596125@c.us
  message: "Benim adım Ali"
  messageLength: 14
  contextLength: 1

2025-10-03 18:01:17 [info]: Response sent to 905521596125@c.us
  response: "Memnun oldum Ali! Ben senin asistanınım."
  responseLength: 42

2025-10-03 18:01:30 [info]: Processing message from 905521596125@c.us
  message: "Benim adım neydi?"
  messageLength: 18
  contextLength: 4

2025-10-03 18:01:32 [info]: Response sent to 905521596125@c.us
  response: "Senin adın Ali."
  responseLength: 16
```

## Rate Limit Aşıldığında

```
2025-10-03 18:02:45 [info]: 📨 Message received from 905521596125@c.us
2025-10-03 18:02:45 [warn]: Rate limit exceeded for 905521596125@c.us
  message: "Hızlı mesaj 6"
  messageLength: 15
  usedMessages: 6
  maxAllowed: 5
```

## Hata Durumu

```
2025-10-03 18:03:10 [info]: Processing message from 905521596125@c.us
  message: "Test sorusu"
  messageLength: 12
  contextLength: 2

2025-10-03 18:03:12 [error]: Error processing message from 905521596125@c.us
  error: "OpenAI API timeout"
  stack: "..."
```

## Grup Mesajları

```
2025-10-03 18:04:20 [info]: 📨 Message received from 120363422194753341@g.us
2025-10-03 18:04:20 [info]: Processing message from 120363422194753341@g.us
  message: "Bot, yarın hava nasıl olacak?"
  messageLength: 30
  contextLength: 1

2025-10-03 18:04:23 [info]: Response sent to 120363422194753341@g.us
  response: "Hava durumu bilgisine erişimim yok ama..."
  responseLength: 85
```

---

## Log Dosyası Boyutu

Mesaj içerikleri kaydedilince log dosyası daha hızlı büyür:

- **Önceki:** ~50 KB / 1000 mesaj
- **Yeni:** ~200-300 KB / 1000 mesaj

Winston otomatik olarak dosyaları rotate eder (5MB olunca yeni dosya açar).

