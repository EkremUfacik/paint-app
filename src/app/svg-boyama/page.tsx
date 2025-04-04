import SVGColoringCanvas from "@/components/SVGColoringCanvas";

export default function SVGColoringPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        SVG Boyama Sayfası
      </h1>

      <SVGColoringCanvas svgSrc="/images/giraffe.svg" title="Zürafa" />

      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Nasıl Kullanılır?
        </h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Aşağıdaki renk paletinden bir renk seçin</li>
          <li>
            Seçtiğiniz renk numarasına ait tüm alanlar sarı renkte
            vurgulanacaktır
          </li>
          <li>Vurgulanan alanları doldurmak için üzerlerine tıklayın</li>
          <li>
            Tüm boyamayı tamamladığınızda "İndir" veya "Paylaş" düğmelerine
            tıklayabilirsiniz
          </li>
          <li>Baştan başlamak için "Sıfırla" düğmesine tıklayın</li>
        </ol>
      </div>
    </main>
  );
}
