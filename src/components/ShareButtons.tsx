interface ShareButtonsProps {
  imageUrl: string;
  title: string;
}

const ShareButtons = ({ imageUrl, title }: ShareButtonsProps) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(imageUrl);

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodedTitle} boyama sayfası&url=${encodedUrl}`;
    window.open(url, "_blank");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle} boyama sayfası`;
    window.open(url, "_blank");
  };

  const shareOnWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodedTitle} boyama sayfası: ${encodedUrl}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={shareOnTwitter}
        className="p-3 rounded-full bg-blue-400 hover:bg-blue-500 text-white transition-colors shadow-md"
        aria-label="Twitter'da paylaş"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      </button>

      <button
        onClick={shareOnFacebook}
        className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md"
        aria-label="Facebook'ta paylaş"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      </button>

      <button
        onClick={shareOnWhatsApp}
        className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors shadow-md"
        aria-label="WhatsApp'ta paylaş"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
    </div>
  );
};

export default ShareButtons;
