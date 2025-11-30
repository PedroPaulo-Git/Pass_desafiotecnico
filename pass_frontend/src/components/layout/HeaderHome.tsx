export function HeaderHome() {
  return (
    <header className="absolute w-full px-4 lg:px-20 pt-20">
      {/* Conteúdo do cabeçalho */}
      <div className="topHeader w-full flex justify-between items-center">
        <img
          src="/assets/Logo_pass.svg"
          className="w-24 md:w-32"
          alt="Logo PASS"
        />
        <div className="opacity-1 transform-none">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-neutral-300 border border-white hover:bg-white/20 hover:backdrop-blur-sm h-9 text-white px-5">
            Fale Conosco
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mt-16 md:mt-24 lg:mt-32">
        <div className="space-y-2 opacity-1 transform-none">
          <div className="text-2xl md:text-4xl lg:text-5xl font-bold lg:max-w-xl">
            <h2 className=" text-white">
              A Solução Completa
            </h2>
            <span className="font-normal text-pass-gray-400 bg-clip-text text-transparent">
              para Frotas e Agências de Turismo e Fretamento
            </span>
          </div>

          <div className="opacity-1">
            <button
              className="inline-flex  
              bg-clip-text text-transparent 
      [background-image:linear-gradient(to_left,#D1D5DB_0%,#1F2937_100%)] 
      items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-shadow duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-neutral-300 text-gray-400 h-9 mt-6 md:mt-8 px-6 md:px-8 border-2 border-gray-400 py-5 md:py-6 text-base md:text-lg hover:bg-transparent cursor-default "
            >
              Seja Pass. Seja Livre
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
