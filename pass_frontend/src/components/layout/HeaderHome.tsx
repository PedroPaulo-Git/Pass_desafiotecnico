export function HeaderHome() {
  return (
    <header className="relative w-full z-10 container mx-auto px-4 lg:px-20 pt-20">
      {/* Conteúdo do cabeçalho */}
      <div className="topHeader w-full flex justify-between items-center">
        <img
          src="/assets/Logo_pass.svg"
          className="w-28 md:w-32"
          alt="Logo PASS"
        />
        <div className="opacity-1 transform-none">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-neutral-300 border border-white hover:bg-white/20 hover:backdrop-blur-sm h-9 text-white px-5">
            Fale Conosco
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mt-28 md:mt-24 lg:mt-32">
        <div className="space-y-2 opacity-1 transform-none">
          <div className="text-3xl md:text-4xl lg:text-5xl font-bold lg:max-w-xl">
            <h2 className=" text-white">A Solução Completa</h2>
            <span className="font-normal inline-flex bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-300 ">
              para Frotas e Agências de Turismo e Fretamento
            </span>
          </div>

          <div className="opacity-1">
            <div className="opacity-1">
              <a
              href="/dashboard"
                className="inline-flex  
       hover:backdrop-blur-sm hover:scale-[101%] ease-in-out duration-3000 transition-transform
      items-center justify-center gap-2 whitespace-nowrap rounded-full 
      font-medium h-9 mt-6 md:mt-8 px-6 md:px-8 border-2
      border-white py-5 md:py-6 text-white text-base md:text-lg cursor-default"
              >
                Seja Pass. Seja Livre
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
