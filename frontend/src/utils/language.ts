
/**
 * 언어에 따른 확장자를 구하는 함수
 * @param language: 프로그래밍 언어
 * @returns {string}: 확장자
 */
export function language_to_extension(language: string): string {
  switch (language) {
    case "Java":
    case "Java (OpenJDK)":
    case "Java 11":
      return ".java";
    case "C++":
    case "C++11":
    case "C++14":
    case "C++17":
    case "C++ (Clang)":
    case "C++11 (Clang)":
    case "C++14 (Clang)":
    case "C++17 (Clang)":
      return ".cc";
    case "C":
    case "C11":
    case "C (Clang)":
    case "C11 (Clang)":
      return ".c";
    case "Python 2":
    case "Python 3":
    case "PyPy2":
    case "PyPy3":
      return ".py";
    case "Go":
      return ".go";
    case "Rust":
      return ".rs"
    case "Kotlin (JVM)":
    case "Kotlin (Native)":
      return ".kt";
    default:
      return "Not Supported now";
  }
}
