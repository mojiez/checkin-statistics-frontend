declare namespace API {
  type BaseResponseMapStringString_ = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  };

  type downloadFileUsingGETParams = {
    /** filePath */
    filePath: string;
  };

  type MapStringString_ = true;
}
