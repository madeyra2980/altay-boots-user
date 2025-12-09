import Image from "next/image";
import Link from "next/link";
import logo from "../utils/logo.jpg";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-12 w-full overflow-hidden text-white bg-gradient-to-r from-[#b7002b]/90 via-[#e00035]/85 to-[#ff0040]/80">
      <div className="absolute inset-0 bg-[url('https://www.shutterstock.com/image-photo/man-boots-deep-snow-winter-260nw-2341564623.jpg')] bg-cover bg-center bg-no-repeat mix-blend-multiply" />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.5fr,1fr,1fr]">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 p-1">
              <Image
                src={logo}
                alt="Altay Boots"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-extrabold uppercase leading-tight">
                Altay Boots
              </p>
              <p className="text-sm text-white/80">
                Тепло, надежность и комфорт в любой погоде.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/90">
              Навигация
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/" className="transition hover:text-yellow-300">
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="transition hover:text-yellow-300"
                >
                  Каталог
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="transition hover:text-yellow-300"
                >
                  Войти
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="transition hover:text-yellow-300"
                >
                  Зарегистрироваться
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/90">
              Контакты
            </p>
            <div className="space-y-2 text-sm text-white/80">
              <p className="leading-tight">
                Телефон: <a href="tel:+77770000000" className="hover:text-yellow-300">+7 777 000 00 00</a>
              </p>
              <p className="leading-tight">
                Почта:{" "}
                <a
                  href="mailto:hello@altayboots.kz"
                  className="hover:text-yellow-300"
                >
                  hello@altayboots.kz
                </a>
              </p>
              <p className="leading-tight">
                Адрес: Алматы, Казахстан
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/20 pt-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p>© {year} Altay Boots. Все права защищены.</p>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide">
            <span className="rounded-full bg-white/10 px-3 py-1">
              Зимняя коллекция
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              Доставка по Казахстану
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              Ручная выделка кожи
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

