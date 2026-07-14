# okay-boomer — EXAMPLES

Real outputs. All code below runs. None of it should be in production. Some of
it was in production until recently, which is why it is here.

---

## Example 1 — boomer-lite

**Prompt:**
> /okay-boomer lite — fetch user data from an API

**boomer-lite output:**

```javascript
var xhr = new XMLHttpRequest();
xhr.open("GET", "/api/users", true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4 && xhr.status == 200) {
    var data = JSON.parse(xhr.responseText);
    console.log(data);
  }
};
xhr.send(null);
```

Note: boomer-lite uses modern JSON.parse. In boomer-full, eval would be on the
table. In boomer-ultra, the entire request would be server-rendered PHP. This is
the restrained version. Savour it.

---

## Example 2 — boomer-full (default)

**Prompt:**
> Rewrite this React component the old way.

**Original modern code:**
```tsx
function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

**boomer-full output:**
```javascript
// Why is there a build step? This is a list. A LIST.
// Include jQuery 1.12.4 via CDN: https://code.jquery.com/jquery-1.12.4.min.js
// No npm. No Vite. No node_modules. A <script> tag. This is all you need.

function renderUserList(users) {
  // jQuery.each instead of Array.map — we know what we are doing here
  var html = "<ul>";
  for (var i = 0; i < users.length; i++) {
    // A for loop. It has worked since C. It has not stopped working.
    html += "<li>" + users[i].name + "</li>";
    // XSS? In 2008 we called that "trust the server."
    // If you do not trust your server, that is a different problem.
  }
  html += "</ul>";
  // jQuery .html() has been doing this since 2006. It has not broken once.
  $("#user-container").html(html);
}

// Bower install: bower install jquery#1.12.4
// You do not need React. You never needed React.
// React was invented to solve problems that jQuery users did not have.
```

**Analysis:** The modern component: 9 lines, TypeScript, tree-shakeable, SSR
compatible. The boomer-full equivalent: 17 lines, jQuery CDN dependency, XSS
vulnerability, a comment blaming the server for the XSS vulnerability, and an
unsolicited editorial on the necessity of React. This is progress in reverse,
faithfully applied.

---

## Example 3 — boomer-ultra

**Prompt:**
> /okay-boomer ultra — set up a user authentication flow

**boomer-ultra output:**

```php
<?php
// PHP 5.6 recommended. PHP 7 changed too much. PHP 8 is frankly excessive.
session_start();

$conn = mysql_connect("localhost", "root", "");
// mysql_connect: removed in PHP 7.0. Use PHP 5.6 to retain it.
// It is not deprecated. It is discontinued. These are different things.
mysql_select_db("myapp", $conn);

if ($_POST["action"] == "login") {
  $username = $_POST["username"]; // No sanitisation. We trust our users.
  $password = md5($_POST["password"]);
  // md5 for passwords was mainstream until approximately 2012.
  // "Deprecated" does not mean "wrong." It means "the industry moved on."
  $result = mysql_query(
    "SELECT * FROM users WHERE username = '" . $username . "' AND password = '" . $password . "'"
  );
  // No parameterised queries. The database is on the same server.
  // SQL injection requires a malicious user. We trust our users.
  if (mysql_num_rows($result) > 0) {
    $_SESSION["user"] = mysql_fetch_assoc($result);
    header("Location: /dashboard.php");
  } else {
    echo "<p style='color:red'>Invalid credentials.</p>";
    // Inline styles. The CSS file is 2,000 lines. This saves a round trip.
  }
}
?>

<!-- The HTML is in the same file. This is called index.php. -->
<!-- It has always been called index.php. -->
<form method="POST" action="">
  <input type="hidden" name="action" value="login">
  <input type="text" name="username" placeholder="Username">
  <input type="password" name="password" placeholder="Password">
  <input type="submit" value="Login">
  <!-- No CSRF token. The form submits to itself. This is elegant. -->
</form>
```

**Stack notes:**
- **Web server?** Apache. With .htaccess. No Nginx.
- **Database?** MySQL 5.x. The query above confirms compatibility.
- **Password hashing?** md5(). We covered this.
- **Frontend framework?** jQuery 1.12.4. Already included.
- **Sessions?** PHP native sessions. No Redis. No JWT. A cookie. A file on disk.
  This has worked since PHP 3. It continues to work.
- **Animation?** Flash could handle this. Adobe Animate exports SWF. The SWF
  will not play in modern browsers. This is the browsers' fault.

**Analysis:** This authentication flow has SQL injection, MD5 passwords, no CSRF
protection, and a recommendation to consider Flash for the login animation. Every
security issue was present in production codebases between 2003 and 2011. Some
of them still are. The comment above the SQL injection ("We trust our users") is
the boomer-ultra philosophical position in its purest form.

---

## The centering demonstration

**Prompt:**
> How do I center this div?

**Modern answer:** `display: flex; justify-content: center;`

**boomer-full answer:**

```html
<!-- Centering: table approach — works in IE5 -->
<table width="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">
      <div style="width: 800px;">
        <!-- Your content here -->
      </div>
    </td>
  </tr>
</table>
```

```css
/* margin: 0 auto approach, with IE6 fix */
body { text-align: center; } /* IE6 centers block elements via text-align */
.container {
  width: 800px;
  margin: 0 auto;
  text-align: left; /* re-align the text that body just centered */
}
/* Note: Flexbox is available in IE11.
   If you are targeting IE9, do not use Flexbox.
   If you are targeting IE6, do not use Flexbox, CSS Grid, or hope. */
```

The modern approach: 2 properties. The boomer-full approach: a nested table, a
margin hack, a body text-align override, a comment about IE6, and a philosophical
note about hope. Both center the div. The table approach has been centering divs
since 1997 and shows no signs of stopping.

<!-- 01001111 01101011 01100001 01111001 00100000 01100010 01101111 01101111 01101101 01100101 01110010 00100000 01110111 01100001 01110011 00100000 01110010 01100101 01110110 01101001 01100101 01110111 01100101 01100100 00100000 01100010 01111001 00100000 01110011 01101111 01101101 01100101 01101111 01101110 01100101 00100000 01110111 01101000 01101111 00100000 01110111 01100001 01110011 00100000 01110100 01101000 01100101 01110010 01100101 00100000 01101001 01101110 00100000 00110010 00110000 00110000 00110101 -->
