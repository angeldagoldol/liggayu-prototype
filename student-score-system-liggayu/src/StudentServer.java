import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Local HTTP adapter. StudentStore, not this adapter, owns the student arrays. */
public final class StudentServer {
    private static final int MAX_REQUEST_BYTES = 8192;
    private final StudentStore store = new StudentStore();
    private final Path webRoot;
    private final int port;

    private StudentServer(Path webRoot, int port) {
        this.webRoot = webRoot;
        this.port = port;
    }

    public static void main(String[] args) throws IOException {
        int port = 8080;
        if (args.length > 1) {
            System.err.println("Usage: java -cp build StudentServer [port]");
            System.exit(1);
        }
        if (args.length == 1) {
            try { port = Integer.parseInt(args[0]); }
            catch (NumberFormatException error) {
                System.err.println("The port must be a whole number from 1024 to 65535.");
                System.exit(1);
            }
        }
        if (port < 1024 || port > 65535) {
            System.err.println("Choose a port from 1024 to 65535.");
            System.exit(1);
        }
        Path webRoot = Path.of("web").toAbsolutePath().normalize();
        if (!Files.isDirectory(webRoot)) {
            System.err.println("The web folder was not found. Run the program from the project folder.");
            System.exit(1);
        }
        var application = new StudentServer(webRoot, port);
        // Listen only on this computer. This prototype is not a public hosting service.
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        server.createContext("/", application::handle);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> server.stop(0)));
        server.start();
        System.out.println("\nScoreDesk — Student Score Management System Using Arrays");
        System.out.println("Open http://localhost:" + port + " in your browser.");
        System.out.println("Keep this terminal open. Press Ctrl+C to stop.");
        System.out.println("Session-only storage: stopping the server clears all records.\n");
    }

    private void handle(HttpExchange exchange) throws IOException {
        var headers = exchange.getResponseHeaders();
        headers.set("Cache-Control", "no-store");
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set("Referrer-Policy", "no-referrer");
        headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; "
                + "style-src 'self'; img-src 'self' data:; connect-src 'self'; "
                + "object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
        try {
            String host = exchange.getRequestHeaders().getFirst("Host");
            if (!("localhost:" + port).equals(host) && !("127.0.0.1:" + port).equals(host)) {
                throw new HttpProblem(403, "Open this local prototype using localhost or 127.0.0.1.");
            }
            String path = exchange.getRequestURI().getPath();
            if (path.startsWith("/api/")) handleApi(exchange, path);
            else serveStatic(exchange, path);
        } catch (HttpProblem error) {
            sendError(exchange, error.status, error.getMessage());
        } catch (IllegalArgumentException error) {
            sendError(exchange, 400, error.getMessage());
        } catch (IllegalStateException error) {
            sendError(exchange, 409, error.getMessage());
        } catch (RuntimeException error) {
            error.printStackTrace(System.err);
            sendError(exchange, 500, "The Java server could not complete the request.");
        } finally {
            exchange.close();
        }
    }

    private void handleApi(HttpExchange exchange, String path) throws IOException {
        if (!Set.of("/api/students", "/api/sample", "/api/reset").contains(path)) {
            throw new HttpProblem(404, "API route not found.");
        }
        String method = exchange.getRequestMethod();
        if (path.equals("/api/students") && method.equals("GET")) {
            sendReport(exchange, 200, store.getReport());
            return;
        }
        if (!method.equals("POST")) {
            exchange.getResponseHeaders().set("Allow", path.equals("/api/students") ? "GET, POST" : "POST");
            throw new HttpProblem(405, "This operation does not support " + method + ".");
        }
        checkMutationRequest(exchange);
        Map<String, String> form = readForm(exchange);
        switch (path) {
            case "/api/students" -> {
                if (!form.keySet().equals(Set.of("name", "score1", "score2", "score3"))) {
                    throw new IllegalArgumentException("Provide a name and exactly three score fields.");
                }
                var report = store.add(form.get("name"), new String[] {
                        form.get("score1"), form.get("score2"), form.get("score3")});
                sendReport(exchange, 201, report);
            }
            case "/api/sample" -> sendReport(exchange, 200, store.loadSample());
            case "/api/reset" -> sendReport(exchange, 200, store.clear());
            default -> throw new HttpProblem(404, "API route not found.");
        }
    }

    private void checkMutationRequest(HttpExchange exchange) {
        // A foreign website cannot send this custom header without a CORS preflight.
        // This server deliberately does not grant cross-origin permission.
        if (!"1".equals(exchange.getRequestHeaders().getFirst("X-ScoreDesk-Request"))) {
            throw new HttpProblem(403, "Use the ScoreDesk website to change records.");
        }
        String origin = exchange.getRequestHeaders().getFirst("Origin");
        if (origin != null && !origin.equals("http://localhost:" + port)
                && !origin.equals("http://127.0.0.1:" + port)) {
            throw new HttpProblem(403, "Cross-origin changes are not allowed.");
        }
    }

    private static Map<String, String> readForm(HttpExchange exchange) throws IOException {
        String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
        if (contentType == null || !contentType.split(";", 2)[0].strip().toLowerCase(Locale.ROOT)
                .equals("application/x-www-form-urlencoded")) {
            throw new HttpProblem(415, "Send form URL-encoded input.");
        }
        byte[] bytes = exchange.getRequestBody().readNBytes(MAX_REQUEST_BYTES + 1);
        if (bytes.length > MAX_REQUEST_BYTES) throw new HttpProblem(413, "The request is too large.");
        String body = new String(bytes, StandardCharsets.UTF_8);
        // This Map only parses an HTTP request; the student records remain in arrays.
        Map<String, String> form = new HashMap<>();
        if (body.isEmpty()) return form;
        for (String pair : body.split("&", -1)) {
            String[] parts = pair.split("=", 2);
            if (parts.length != 2) throw new IllegalArgumentException("Malformed form input.");
            String key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
            String value = URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            if (form.putIfAbsent(key, value) != null) {
                throw new IllegalArgumentException("Duplicate form field: " + key);
            }
        }
        return form;
    }

    private void serveStatic(HttpExchange exchange, String path) throws IOException {
        String method = exchange.getRequestMethod();
        if (!method.equals("GET") && !method.equals("HEAD")) {
            exchange.getResponseHeaders().set("Allow", "GET, HEAD");
            throw new HttpProblem(405, "Static files support GET and HEAD only.");
        }
        if (path.equals("/favicon.ico")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        // An explicit allow-list prevents traversal and exposure of Java source files.
        String file;
        String contentType;
        switch (path) {
            case "/", "/index.html" -> { file = "index.html"; contentType = "text/html"; }
            case "/styles.css" -> { file = "styles.css"; contentType = "text/css"; }
            case "/app.js" -> { file = "app.js"; contentType = "application/javascript"; }
            default -> throw new HttpProblem(404, "Page not found.");
        }
        Path target = webRoot.resolve(file);
        if (!Files.isRegularFile(target)) throw new HttpProblem(404, "The website file was not found: " + file);
        send(exchange, 200, contentType + "; charset=utf-8", Files.readAllBytes(target));
    }

    private static void sendReport(HttpExchange exchange, int status, StudentStore.Report report) throws IOException {
        StringBuilder json = new StringBuilder();
        json.append("{\"count\":").append(report.students().length)
                .append(",\"capacity\":").append(StudentStore.MAX_STUDENTS)
                .append(",\"scoreCount\":").append(StudentStore.SCORE_COUNT)
                .append(",\"classAverage\":").append(report.classAverage())
                .append(",\"highestAverage\":").append(report.highestAverage())
                .append(",\"lowestAverage\":").append(report.lowestAverage())
                .append(",\"students\":[");
        for (int i = 0; i < report.students().length; i++) {
            if (i > 0) json.append(',');
            var row = report.students()[i];
            json.append("{\"index\":").append(row.index())
                    .append(",\"name\":").append(quote(row.name())).append(",\"scores\":[");
            for (int j = 0; j < row.scores().length; j++) {
                if (j > 0) json.append(',');
                json.append(row.scores()[j]);
            }
            json.append("],\"average\":").append(row.average())
                    .append(",\"highest\":").append(row.highest())
                    .append(",\"lowest\":").append(row.lowest()).append('}');
        }
        json.append("]}");
        send(exchange, status, "application/json; charset=utf-8", json.toString().getBytes(StandardCharsets.UTF_8));
    }

    private static void sendError(HttpExchange exchange, int status, String message) throws IOException {
        String json = "{\"error\":" + quote(message == null ? "Invalid request." : message) + "}";
        send(exchange, status, "application/json; charset=utf-8", json.getBytes(StandardCharsets.UTF_8));
    }

    /** Small JSON string encoder; no external JSON library is needed for this response shape. */
    private static String quote(String text) {
        StringBuilder result = new StringBuilder("\"");
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            switch (c) {
                case '"' -> result.append("\\\"");
                case '\\' -> result.append("\\\\");
                case '\n' -> result.append("\\n");
                case '\r' -> result.append("\\r");
                case '\t' -> result.append("\\t");
                default -> {
                    if (c < 0x20 || c == '\u2028' || c == '\u2029') result.append(String.format("\\u%04x", (int) c));
                    else result.append(c);
                }
            }
        }
        return result.append('"').toString();
    }

    private static void send(HttpExchange exchange, int status, String contentType, byte[] body) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", contentType);
        if (exchange.getRequestMethod().equals("HEAD")) {
            exchange.getResponseHeaders().set("Content-Length", Integer.toString(body.length));
            exchange.sendResponseHeaders(status, -1);
        } else {
            exchange.sendResponseHeaders(status, body.length);
            exchange.getResponseBody().write(body);
        }
    }

    private static final class HttpProblem extends RuntimeException {
        private static final long serialVersionUID = 1L;
        final int status;
        HttpProblem(int status, String message) { super(message); this.status = status; }
    }
}
