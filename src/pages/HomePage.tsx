import React from "react";
import { Link } from "react-router-dom";
import { SVG_TEMPLATES } from "../data/svgTemplates";

const HomePage = () => {
  return (
    <div className="bg-light min-h-screen">
      <h1 className="text-2xl text-primary font-bold mb-4">
        SVG Boyama Uygulaması
      </h1>
      <p className="text-secondary mb-4">Boyamak istediğiniz şablonu seçin:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {SVG_TEMPLATES.map((template) => (
          <Link to={`/template/${template.id}`}>
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <h3 className="p-4 m-0 bg-gray-100 text-lg font-medium text-center">
                {template.title}
              </h3>
              <div className="h-44 flex items-center justify-center p-4 bg-white">
                <img
                  src={template.src}
                  alt={template.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="block bg-primary text-white text-center py-3 px-4 no-underline font-medium hover:bg-accent1 transition-colors duration-200">
                Bu Resmi Boya
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
