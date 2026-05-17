const container = document.querySelector("#cards-container");

container.innerHTML = objects
  .map(
    (object) => `
      <article>
        <h2>${object.title}</h2>
        <p>${object.period}</p>
      </article>
    `,
  )
  .join("");
