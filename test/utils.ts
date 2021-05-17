let dateSpy: jest.SpyInstance;

export const mockDate = () => {
  const targetDate: any = new Date(1000);
  dateSpy = jest.spyOn(global, "Date").mockImplementation(() => targetDate);
};

export const unmockDate = () => {
  dateSpy.mockRestore();
};
