# Glow Maker for TL Pro

> **A ferramenta definitiva para criar efeitos visuais procedurais, partículas e projéteis mágicos para Mods de Terraria.**

O **Glow Maker for TL Pro** é uma aplicação web poderosa construída com **React Three Fiber** e **Shaders GLSL**, desenhada especificamente para *pixel artists* e *modders*. Esta ferramenta resolve o problema complexo de criar *sprites* de luz, auras mágicas e projéteis animados frame-a-frame manualmente, permitindo gerar *spritesheets* perfeitamente repetíveis (*loops*) ou caóticos em segundos.

---

## 📑 Índice

1.  [Recursos Principais](#-recursos-principais)
2.  [Guia do Editor (Modo Criação)](#-guia-do-editor)
3.  [Estúdio de Spritesheet (Automação)](#-estúdio-de-spritesheet)
4.  [Integração com Terraria (tModLoader)](#-integração-com-terraria-tmodloader)
    * [Implementar um Projétil Animado](#exemplo-1-projétil-mágico-simples)
    * [Dicas de Renderização (Additive Blending)](#dicas-de-renderização)
5.  [Exemplos de Casos de Uso](#-exemplos-de-casos-de-uso)
6.  [Instalação e Desenvolvimento](#-instalação-e-desenvolvimento)

---

## 🚀 Recursos Principais

* **Renderização Procedural:** Nada é desenhado à mão. Tudo é matemática (SDFs e Noise), garantindo qualidade infinita antes da pixelização.
* **Pixel-Perfect Output:** Controlo total sobre a resolução (32px, 64px, etc.). O exportador remove a suavização (*anti-aliasing*) indesejada para garantir o visual "crocante" característico do Terraria.
* **Biblioteca Local:** Guarde os seus predefinições (*presets*) favoritos no navegador para editar posteriormente.
* **Spritesheet Studio:** Gerador automático de tiras de animação (*Vertical Strips*) prontas para o jogo.
* **Modos de Animação:**
    * **Twist (Rotação):** Cria *loops* perfeitos de rotação.
    * **Seed (Caos):** Cria variações aleatórias para fogo, eletricidade e fumo.
* **Visualização em Tempo Real:** Pré-visualize a animação a correr a 12 FPS antes de exportar.
* **Responsividade:** Funciona em *Desktop* e *Mobile* com interface adaptável.

---

## 🎨 Guia do Editor

O painel principal é onde esculpe a aparência do seu efeito.

### Formas Básicas (Shape Modes)
1.  **Centro:** Um ponto de luz difuso. Ideal para partículas simples (`Dust`).
2.  **Anel:** Um círculo vazado. Ótimo para ondas de choque ou auras.
3.  **Nebulosa:** Nuvens de ruído fractal. Perfeito para magias elementais.
4.  **Estrela:** Forma pontiaguda configurável.
5.  **Polígono:** Formas geométricas (quadrados, hexágonos) com bordas brilhantes.

### Parâmetros Cruciais
* **Pixel Count:** Define a resolução final. Para Terraria, geralmente **32px** (projéteis pequenos) ou **64px** (projéteis médios/bosses) é o ideal.
* **Falloff (Alcance/Corte):** Corta a luz suavemente nas bordas. **Essencial** para evitar que o *sprite* tenha píxeis semitransparentes invisíveis que atrapalham a colisão ou ocupam memória desnecessariamente.
* **Distortion (Noise):** Adiciona "turbulência" à forma. Utilize para criar efeitos de fogo ou instabilidade mágica.
* **Gain & Contrast:** Controlam o "brilho". No Terraria, cores muito escuras podem ficar invisíveis se utilizar *Additive Blending*. Mantenha o ganho alto.

---

## 🎬 Estúdio de Spritesheet

Após guardar o seu Glow na biblioteca, vá para o **Studio** para gerar a animação. O Terraria lê animações verticalmente (uma imagem em cima da outra).

### Como Gerar
1.  Selecione o seu Glow na barra lateral esquerda.
2.  Escolha o **Modo de Animação**:
    * **🌊 Distorção (Seed):** Altera a "semente" do ruído a cada frame. O sprite muda de forma organicamente.
        * *Uso:* Fogo, Energia Instável, Gosma.
    * **🌀 Rotação (Twist):** Gira o sprite matematicamente.
        * *Uso:* Shurikens Mágicas, Portais, Moedas, Orbes.
3.  Defina a **Velocidade**:
    * Em modo *Twist*, `1.0x` significa 1 volta completa (360º) dividida pelo número de frames (*Loop* Perfeito).
4.  **Gerar e Baixar:** Clique em exportar para baixar o ficheiro `.png` vertical.

---
### Link
- Acesse o app e teste: https://glow-maker-for-tl-pro-m6m6.vercel.app/#/
